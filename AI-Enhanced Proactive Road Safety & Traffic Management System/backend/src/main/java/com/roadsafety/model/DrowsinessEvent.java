package com.roadsafety.model;

import jakarta.persistence.*;

@Entity
@Table(name = "drowsiness_events")
public class DrowsinessEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private TrafficEvent trafficEvent;

    @Column(name = "driver_id")
    private Integer driverId;

    @Column(name = "cue_type")
    private String cueType;
    
    @Column(name = "warning_level")
    private String warningLevel;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public TrafficEvent getTrafficEvent() { return trafficEvent; }
    public void setTrafficEvent(TrafficEvent trafficEvent) { this.trafficEvent = trafficEvent; }
    
    public Integer getDriverId() { return driverId; }
    public void setDriverId(Integer driverId) { this.driverId = driverId; }
    
    public String getCueType() { return cueType; }
    public void setCueType(String cueType) { this.cueType = cueType; }
    
    public String getWarningLevel() { return warningLevel; }
    public void setWarningLevel(String warningLevel) { this.warningLevel = warningLevel; }
}
