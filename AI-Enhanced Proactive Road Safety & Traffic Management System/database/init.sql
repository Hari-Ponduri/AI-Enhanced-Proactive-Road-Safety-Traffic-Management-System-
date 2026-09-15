-- database/init.sql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    fps INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE,
    vehicle_type VARCHAR(50),
    color VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    license_number VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    risk_profile VARCHAR(50) DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traffic_events (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id),
    timestamp TIMESTAMP NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'VIOLATION', 'HAZARD', 'EMERGENCY', 'ACCIDENT', 'DROWSINESS'
    confidence DECIMAL(5, 2),
    severity VARCHAR(20),            -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    vehicle_id INTEGER REFERENCES vehicles(id),
    evidence_path VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'VERIFIED', 'DISMISSED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE violations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES traffic_events(id) ON DELETE CASCADE,
    violation_type VARCHAR(50),      -- 'OVERSPEED', 'RED_LIGHT', 'WRONG_SIDE', 'HELMET', 'SEATBELT', 'PHONE'
    speed DECIMAL(5, 2),
    speed_limit DECIMAL(5, 2)
);

CREATE TABLE drowsiness_events (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES traffic_events(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id),
    cue_type VARCHAR(50),            -- 'EYE_CLOSURE', 'YAWNING', 'HEAD_DROP'
    warning_level VARCHAR(20)
);

CREATE TABLE road_hazards (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES traffic_events(id) ON DELETE CASCADE,
    hazard_type VARCHAR(50),         -- 'POTHOLE', 'DEBRIS', 'PEDESTRIAN'
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    lifecycle_status VARCHAR(50) DEFAULT 'NEW' -- 'NEW', 'VERIFIED', 'ACTIVE', 'REPAIRED', 'CLOSED'
);

CREATE TABLE ambulance_events (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES traffic_events(id) ON DELETE CASCADE,
    direction VARCHAR(50),
    eta_seconds INTEGER,
    priority_level VARCHAR(20)
);

CREATE TABLE accidents (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES traffic_events(id) ON DELETE CASCADE,
    involved_vehicles INTEGER,
    estimated_severity VARCHAR(20)
);

CREATE TABLE risk_scores (
    id SERIAL PRIMARY KEY,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    risk_level VARCHAR(20),          -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO users (username, password_hash, role) VALUES ('admin', 'hashed_pass', 'ADMIN');

INSERT INTO cameras (name, location_lat, location_lng) VALUES 
('Junction A - Main St', 34.0522, -118.2437),
('Highway 1 - Northbound', 34.0525, -118.2440),
('Downtown Intersection', 34.0530, -118.2450);

INSERT INTO traffic_events (camera_id, timestamp, event_type, confidence, severity, status) VALUES 
(1, NOW() - INTERVAL '1 hour', 'VIOLATION', 0.95, 'HIGH', 'VERIFIED'),
(2, NOW() - INTERVAL '2 hours', 'HAZARD', 0.85, 'MEDIUM', 'ACTIVE'),
(3, NOW() - INTERVAL '10 minutes', 'EMERGENCY', 0.99, 'CRITICAL', 'PENDING_REVIEW');

INSERT INTO violations (event_id, violation_type, speed, speed_limit) VALUES 
(1, 'OVERSPEED', 85.5, 60.0);

INSERT INTO road_hazards (event_id, hazard_type, location_lat, location_lng, lifecycle_status) VALUES 
(2, 'POTHOLE', 34.0526, -118.2441, 'ACTIVE');

INSERT INTO ambulance_events (event_id, direction, eta_seconds, priority_level) VALUES 
(3, 'NORTHBOUND', 120, 'HIGH');

INSERT INTO risk_scores (location_lat, location_lng, score, risk_level) VALUES 
(34.0522, -118.2437, 45, 'MEDIUM'),
(34.0525, -118.2440, 75, 'HIGH'),
(34.0530, -118.2450, 15, 'LOW');
