package com.roadsafety.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ambulance_events")
public class AmbulanceEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private TrafficEvent trafficEvent;

    private String direction;
    
    @Column(name = "eta_seconds")
    private Integer etaSeconds;
    
    @Column(name = "priority_level")
    private String priorityLevel;
    
    @Column(name = "green_corridor_status")
    private String greenCorridorStatus = "PENDING"; // PENDING, APPROVED_SIMULATED, REQUIRES_HUMAN_REVIEW

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public TrafficEvent getTrafficEvent() { return trafficEvent; }
    public void setTrafficEvent(TrafficEvent trafficEvent) { this.trafficEvent = trafficEvent; }
    
    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }
    
    public Integer getEtaSeconds() { return etaSeconds; }
    public void setEtaSeconds(Integer etaSeconds) { this.etaSeconds = etaSeconds; }
    
    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }
    
    public String getGreenCorridorStatus() { return greenCorridorStatus; }
    public void setGreenCorridorStatus(String greenCorridorStatus) { this.greenCorridorStatus = greenCorridorStatus; }
}
