# Setup Instructions

## Prerequisites
- Docker
- Docker Compose

## Running the System

To start the system in local development mode, simply run:

```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database (port 5432) with seed data initialized.
- Spring Boot Backend (port 8080)
- Python FastAPI AI Service (port 8000)
- React Vite Frontend (port 5173)

## Accessing the Dashboard

Once all containers are running and healthy, open your web browser and navigate to:
`http://localhost:5173`

The dashboard will automatically poll the backend and AI service to display their health statuses.

## Troubleshooting

- If the frontend shows `backend: DOWN`, wait a few seconds and refresh. Spring Boot might take ~15-30 seconds to start.
- If you see port conflicts, ensure ports 5432, 8080, 8000, and 5173 are free on your host machine.
