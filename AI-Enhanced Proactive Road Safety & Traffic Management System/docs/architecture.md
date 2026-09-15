# System Architecture

## Overview

The AI-Enhanced Proactive Road Safety & Traffic Management System follows a microservices pattern, decoupled into distinct components to allow independent scaling, development, and deployment.

### 1. Frontend (React + Vite)
Provides the user interface for administrators to monitor live traffic feeds, review detected events, and analyze risk data.

### 2. Backend (Spring Boot)
Acts as the central integration point. It handles data persistence, user management, and orchestration between the UI and the AI Service.

### 3. AI Service (Python FastAPI)
Dedicated to compute-intensive tasks. It processes video feeds (live or uploaded), runs ML inference for object detection (vehicles, pedestrians, potholes, ambulances), detects driver drowsiness, and calculates risk scores.

### 4. Database (PostgreSQL)
A robust relational database storing all configuration (cameras, users) and operational data (events, violations, risk history).

## Data Flow
1. **Video Ingestion**: Camera feeds or video uploads go to the AI Service.
2. **Inference**: AI Service processes frames, identifies events (e.g., Overspeed, Pothole).
3. **Event Registration**: AI Service calls Backend API to register the event.
4. **Persistence**: Backend saves event to PostgreSQL with `status=PENDING_REVIEW`.
5. **Dashboard Notification**: Frontend polls (or receives WebSockets in future phases) from Backend to display new events.
