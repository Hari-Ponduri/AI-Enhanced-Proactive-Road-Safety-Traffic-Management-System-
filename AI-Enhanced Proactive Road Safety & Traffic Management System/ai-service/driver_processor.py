import cv2
import mediapipe as mp
import time
import os
import requests
import logging
import math

logger = logging.getLogger(__name__)

mp_face_mesh = mp.solutions.face_mesh
BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8080")
STORAGE_DIR = "storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

# EAR landmark indices
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]
# MAR landmark indices
MOUTH = [78, 81, 13, 311, 308, 402, 14, 178]

EAR_THRESHOLD = 0.22
MAR_THRESHOLD = 0.5
CONSECUTIVE_FRAMES_CLOSED = 15

def calculate_aspect_ratio(landmarks, indices):
    # compute distances between vertical and horizontal landmarks
    # Standard EAR/MAR calculation logic simplified for this prototype
    if len(indices) == 6: # Eye
        p2_p6 = math.hypot(landmarks[indices[1]].x - landmarks[indices[5]].x, landmarks[indices[1]].y - landmarks[indices[5]].y)
        p3_p5 = math.hypot(landmarks[indices[2]].x - landmarks[indices[4]].x, landmarks[indices[2]].y - landmarks[indices[4]].y)
        p1_p4 = math.hypot(landmarks[indices[0]].x - landmarks[indices[3]].x, landmarks[indices[0]].y - landmarks[indices[3]].y)
        return (p2_p6 + p3_p5) / (2.0 * p1_p4)
    else: # Mouth
        p2_p8 = math.hypot(landmarks[indices[1]].x - landmarks[indices[7]].x, landmarks[indices[1]].y - landmarks[indices[7]].y)
        p3_p7 = math.hypot(landmarks[indices[2]].x - landmarks[indices[6]].x, landmarks[indices[2]].y - landmarks[indices[6]].y)
        p4_p6 = math.hypot(landmarks[indices[3]].x - landmarks[indices[5]].x, landmarks[indices[3]].y - landmarks[indices[5]].y)
        p1_p5 = math.hypot(landmarks[indices[0]].x - landmarks[indices[4]].x, landmarks[indices[0]].y - landmarks[indices[4]].y)
        return (p2_p8 + p3_p7 + p4_p6) / (3.0 * p1_p5)

def process_driver_video(video_path: str, camera_id: int = 1, driver_id: int = 1):
    logger.info(f"Starting driver monitoring on video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    eyes_closed_frames = 0
    yawn_count = 0
    
    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as face_mesh:
    
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            h, w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    left_ear = calculate_aspect_ratio(face_landmarks.landmark, LEFT_EYE)
                    right_ear = calculate_aspect_ratio(face_landmarks.landmark, RIGHT_EYE)
                    ear = (left_ear + right_ear) / 2.0
                    
                    mar = calculate_aspect_ratio(face_landmarks.landmark, MOUTH)
                    
                    # Drowsiness detection logic
                    event_type = None
                    warning_level = None
                    
                    if ear < EAR_THRESHOLD:
                        eyes_closed_frames += 1
                        if eyes_closed_frames >= CONSECUTIVE_FRAMES_CLOSED:
                            event_type = "EYE_CLOSURE"
                            warning_level = "CRITICAL"
                    else:
                        eyes_closed_frames = 0
                        
                    if mar > MAR_THRESHOLD:
                        yawn_count += 1
                        if yawn_count > 5: # Yawned multiple frames
                            event_type = "YAWNING"
                            warning_level = "MEDIUM"
                            yawn_count = 0 # reset
                            
                    if event_type:
                        logger.warning(f"Driver Drowsiness Alert! {event_type} - {warning_level}")
                        
                        timestamp = int(time.time() * 1000)
                        evidence_filename = f"drowsiness_{timestamp}.jpg"
                        evidence_path = os.path.join(STORAGE_DIR, evidence_filename)
                        
                        cv2.putText(frame, f"ALERT: {event_type}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                        if warning_level == "CRITICAL":
                            cv2.putText(frame, "POSSIBLE IMPAIRED/UNSAFE DRIVING", (50, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                            
                        cv2.imwrite(evidence_path, frame)
                        
                        event_payload = {
                            "cameraId": camera_id,
                            "eventType": "DROWSINESS",
                            "confidence": 0.95,
                            "severity": warning_level,
                            "evidencePath": f"/storage/{evidence_filename}",
                            "driverId": driver_id,
                            "cueType": event_type,
                            "warningLevel": warning_level
                        }
                        
                        try:
                            requests.post(f"{BACKEND_URL}/api/events", json=event_payload)
                        except Exception:
                            pass
                            
                        time.sleep(2) # Cooldown before next alert

    cap.release()
    logger.info("Finished driver processing")
