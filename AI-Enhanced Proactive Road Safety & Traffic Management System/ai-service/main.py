from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os
from video_processor import process_video
from driver_processor import process_driver_video

app = FastAPI(title="AI Road Safety Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("storage", exist_ok=True)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

class RiskPredictionRequest(BaseModel):
    traffic_density: float
    vehicle_speed: float
    weather_condition: str

@app.post("/api/video/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    file_path = os.path.join("storage", f"traffic_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    background_tasks.add_task(process_video, file_path)
    return {"status": "processing", "filename": file.filename, "mode": "traffic"}

@app.post("/api/video/upload/driver")
async def upload_driver_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    file_path = os.path.join("storage", f"driver_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    background_tasks.add_task(process_driver_video, file_path)
    return {"status": "processing", "filename": file.filename, "mode": "driver"}

@app.get("/health")
def health_check():
    return {"status": "up", "service": "ai-service"}

@app.post("/detect/vehicles")
def detect_vehicles():
    return {"status": "simulated", "message": "Vehicle detection endpoint"}

@app.post("/detect/pedestrians")
def detect_pedestrians():
    return {"status": "simulated", "message": "Pedestrian detection endpoint"}

@app.post("/detect/ambulance")
def detect_ambulance():
    return {"status": "simulated", "message": "Ambulance detection endpoint"}

@app.post("/detect/potholes")
def detect_potholes():
    return {"status": "simulated", "message": "Pothole detection endpoint"}

@app.post("/detect/violations")
def detect_violations():
    return {"status": "simulated", "message": "Violations detection endpoint"}

@app.post("/detect/accident")
def detect_accident():
    return {"status": "simulated", "message": "Accident detection endpoint"}

@app.post("/detect/drowsiness")
def detect_drowsiness():
    return {"status": "simulated", "message": "Drowsiness detection endpoint"}

@app.post("/predict/risk")
def predict_risk(request: RiskPredictionRequest):
    # Simulated risk prediction
    score = 45
    level = "MEDIUM"
    if request.weather_condition.lower() == "rain" and request.vehicle_speed > 60:
        score = 85
        level = "HIGH"
    return {"risk_score": score, "risk_level": level}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
