package com.roadsafety.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private TrafficEvent trafficEvent;

    @Column(name = "violation_type")
    private String violationType;

    private Double speed;
    
    @Column(name = "speed_limit")
    private Double speedLimit = 60.0;
    
    @Column(name = "mock_license_plate")
    private String mockLicensePlate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public TrafficEvent getTrafficEvent() { return trafficEvent; }
    public void setTrafficEvent(TrafficEvent trafficEvent) { this.trafficEvent = trafficEvent; }
    
    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }
    
    public Double getSpeed() { return speed; }
    public void setSpeed(Double speed) { this.speed = speed; }
    
    public Double getSpeedLimit() { return speedLimit; }
    public void setSpeedLimit(Double speedLimit) { this.speedLimit = speedLimit; }
    
    public String getMockLicensePlate() { return mockLicensePlate; }
    public void setMockLicensePlate(String mockLicensePlate) { this.mockLicensePlate = mockLicensePlate; }
}
