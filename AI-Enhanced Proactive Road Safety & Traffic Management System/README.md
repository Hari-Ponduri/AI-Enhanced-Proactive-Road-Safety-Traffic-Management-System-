# AI-Enhanced Proactive Road Safety & Traffic Management System

A research/academic prototype for road safety and traffic management, integrating AI/computer vision to detect traffic violations, safety hazards, driver drowsiness, accidents, and track emergency vehicles.

## WARNING
This is a research prototype. It must not be used for automated legal enforcement. All enforcement and emergency actions are simulated or require authorized human confirmation.

## System Architecture

The project is structured as a modular microservices architecture:
- **Backend**: Spring Boot + Java (REST API for business logic & data persistence)
- **AI Service**: FastAPI + Python (Video processing, Object detection, Risk prediction)
- **Frontend**: React + TypeScript + Vite (Responsive dashboard)
- **Database**: PostgreSQL (Relational data & GIS support)

## Getting Started

Please see `docs/setup.md` for instructions on running the application locally via Docker Compose.
