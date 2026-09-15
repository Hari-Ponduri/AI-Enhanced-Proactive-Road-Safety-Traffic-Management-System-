import cv2
import os
import requests
from ultralytics import YOLO
import time
import logging
import math
import random

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

try:
    model = YOLO("yolov8n.pt")
except Exception as e:
    logger.error(f"Error loading YOLO model: {e}")
    model = None

# Mocking YOLO26 for Ambulance Classification as requested
class YOLO26AmbulanceMock:
    def classify(self, frame, bbox):
        # In a real scenario, this would load 'yolo26.pt' and run inference on the bbox
        # For this prototype, we randomly classify certain large vehicles as an ambulance
        # to simulate YOLO26 detecting specific ambulance visual markers.
        return random.random() > 0.8 # 20% chance a truck/bus is classified as ambulance by YOLO26

yolo26_ambulance_model = YOLO26AmbulanceMock()

BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8080")
STORAGE_DIR = "storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

def process_video(video_path: str, camera_id: int = 1):
    if not model:
        logger.error("YOLO model not loaded. Skipping processing.")
        return

    logger.info(f"Starting to process video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Cannot open video file: {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30
    frame_skip = int(fps / 2)
    
    frame_count = 0
    tracked_objects = {}
    next_object_id = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        if frame_count % frame_skip != 0:
            continue
            
        results = model(frame, verbose=False)
        current_centroids = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]
                conf = float(box.conf[0])
                
                if class_name in ['car', 'motorcycle', 'bus', 'truck'] and conf > 0.5:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cx = (x1 + x2) // 2
                    cy = (y1 + y2) // 2
                    current_centroids.append((cx, cy, class_name, conf, (x1,y1,x2,y2)))
        
        for cx, cy, class_name, conf, bbox in current_centroids:
            matched_id = None
            min_dist = float('inf')
            
            for obj_id, (old_cx, old_cy, last_frame) in tracked_objects.items():
                if frame_count - last_frame > frame_skip * 3:
                    continue 
                dist = math.hypot(cx - old_cx, cy - old_cy)
                if dist < 150 and dist < min_dist: 
                    min_dist = dist
                    matched_id = obj_id
                    
            if matched_id is None:
                matched_id = next_object_id
                next_object_id += 1
                
            time_diff = frame_skip / fps
            pixel_speed = min_dist / time_diff if matched_id in tracked_objects else 0
            mock_speed_mph = min(pixel_speed * 0.15, 120)
            
            is_wrong_side = False
            direction = "UNKNOWN"
            if matched_id in tracked_objects:
                _, old_cy, _ = tracked_objects[matched_id]
                if (cy - old_cy) > 20:
                    is_wrong_side = True
                    direction = "SOUTHBOUND"
                elif (cy - old_cy) < -20:
                    direction = "NORTHBOUND"

            tracked_objects[matched_id] = (cx, cy, frame_count)
            
            # AMBULANCE CLASSIFICATION (using YOLO26 mock)
            is_ambulance = False
            if class_name in ['truck', 'bus', 'car'] and mock_speed_mph > 20:
                if yolo26_ambulance_model.classify(frame, bbox):
                    is_ambulance = True
            
            violation_type = None
            if is_ambulance:
                # Ambulance overrides violations
                logger.info(f"YOLO26 Detected Ambulance! Speed: {mock_speed_mph:.1f}")
                timestamp = int(time.time() * 1000)
                evidence_filename = f"ambulance_{timestamp}.jpg"
                evidence_path = os.path.join(STORAGE_DIR, evidence_filename)
                
                x1, y1, x2, y2 = bbox
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(frame, "AMBULANCE", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                cv2.imwrite(evidence_path, frame)
                
                eta_seconds = max(10, int(120 - mock_speed_mph))
                
                event_payload = {
                    "cameraId": camera_id,
                    "eventType": "EMERGENCY",
                    "confidence": conf + 0.1, # Boost confidence for simulation
                    "severity": "CRITICAL",
                    "evidencePath": f"/storage/{evidence_filename}",
                    "direction": direction,
                    "etaSeconds": eta_seconds
                }
                
                try:
                    requests.post(f"{BACKEND_URL}/api/events", json=event_payload)
                except Exception:
                    pass
                time.sleep(1)
                
            else:
                if mock_speed_mph > 65:
                    violation_type = 'OVERSPEED'
                elif is_wrong_side:
                    violation_type = 'WRONG_SIDE'
                    
                if violation_type:
                    timestamp = int(time.time() * 1000)
                    evidence_filename = f"{violation_type.lower()}_{timestamp}.jpg"
                    evidence_path = os.path.join(STORAGE_DIR, evidence_filename)
                    
                    x1, y1, x2, y2 = bbox
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cv2.putText(frame, f"{violation_type} {mock_speed_mph:.0f}MPH", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                    cv2.imwrite(evidence_path, frame)
                    
                    event_payload = {
                        "cameraId": camera_id,
                        "eventType": "VIOLATION",
                        "confidence": conf,
                        "severity": "HIGH",
                        "evidencePath": f"/storage/{evidence_filename}",
                        "violationType": violation_type,
                        "speed": mock_speed_mph
                    }
                    try:
                        requests.post(f"{BACKEND_URL}/api/events", json=event_payload)
                    except Exception:
                        pass
                    time.sleep(1)
                
        # Mock Pothole Detection
        if random.random() < 0.02: 
            timestamp = int(time.time() * 1000)
            evidence_filename = f"pothole_{timestamp}.jpg"
            evidence_path = os.path.join(STORAGE_DIR, evidence_filename)
            
            h, w, _ = frame.shape
            cv2.circle(frame, (w//2, int(h*0.75)), 40, (0, 165, 255), -1) 
            cv2.putText(frame, "POTHOLE DETECTED", (w//2 - 100, int(h*0.75) - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 165, 255), 2)
            cv2.imwrite(evidence_path, frame)
            
            event_payload = {
                "cameraId": camera_id,
                "eventType": "HAZARD",
                "confidence": 0.85,
                "severity": "MEDIUM",
                "evidencePath": f"/storage/{evidence_filename}"
            }
            try:
                requests.post(f"{BACKEND_URL}/api/events", json=event_payload)
            except Exception:
                pass

    cap.release()
    logger.info(f"Finished processing video: {video_path}")
