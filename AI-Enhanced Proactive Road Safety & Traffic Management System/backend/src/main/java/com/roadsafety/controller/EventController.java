package com.roadsafety.controller;

import com.roadsafety.model.TrafficEvent;
import com.roadsafety.model.Violation;
import com.roadsafety.model.AmbulanceEvent;
import com.roadsafety.model.DrowsinessEvent;
import com.roadsafety.repository.EventRepository;
import com.roadsafety.repository.ViolationRepository;
import com.roadsafety.repository.AmbulanceRepository;
import com.roadsafety.repository.DrowsinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ViolationRepository violationRepository;
    
    @Autowired
    private AmbulanceRepository ambulanceRepository;

    @Autowired
    private DrowsinessRepository drowsinessRepository;

    @PostMapping("/events")
    public ResponseEntity<TrafficEvent> createEvent(@RequestBody Map<String, Object> payload) {
        TrafficEvent event = new TrafficEvent();
        if (payload.containsKey("cameraId")) event.setCameraId((Integer) payload.get("cameraId"));
        if (payload.containsKey("eventType")) event.setEventType((String) payload.get("eventType"));
        if (payload.containsKey("confidence")) {
            Object confObj = payload.get("confidence");
            event.setConfidence(confObj instanceof Double ? (Double) confObj : ((Integer) confObj).doubleValue());
        }
        if (payload.containsKey("severity")) event.setSeverity((String) payload.get("severity"));
        if (payload.containsKey("evidencePath")) event.setEvidencePath((String) payload.get("evidencePath"));
        
        TrafficEvent savedEvent = eventRepository.save(event);

        if ("VIOLATION".equals(event.getEventType())) {
            Violation violation = new Violation();
            violation.setTrafficEvent(savedEvent);
            if (payload.containsKey("violationType")) {
                violation.setViolationType((String) payload.get("violationType"));
            }
            if (payload.containsKey("speed")) {
                Object speedObj = payload.get("speed");
                violation.setSpeed(speedObj instanceof Double ? (Double) speedObj : ((Integer) speedObj).doubleValue());
            }
            
            Random random = new Random();
            String plate = "XYZ-" + (1000 + random.nextInt(9000));
            violation.setMockLicensePlate(plate);
            violationRepository.save(violation);
        } else if ("EMERGENCY".equals(event.getEventType())) {
            AmbulanceEvent ambEvent = new AmbulanceEvent();
            ambEvent.setTrafficEvent(savedEvent);
            
            if (payload.containsKey("direction")) {
                ambEvent.setDirection((String) payload.get("direction"));
            }
            if (payload.containsKey("etaSeconds")) {
                Object etaObj = payload.get("etaSeconds");
                ambEvent.setEtaSeconds(etaObj instanceof Integer ? (Integer) etaObj : ((Double) etaObj).intValue());
            }
            
            ambEvent.setPriorityLevel("CRITICAL");
            
            if (event.getConfidence() != null && event.getConfidence() > 0.80) {
                ambEvent.setGreenCorridorStatus("APPROVED_SIMULATED");
            } else {
                ambEvent.setGreenCorridorStatus("REQUIRES_HUMAN_REVIEW");
            }
            
            ambulanceRepository.save(ambEvent);
        } else if ("DROWSINESS".equals(event.getEventType())) {
            DrowsinessEvent dEvent = new DrowsinessEvent();
            dEvent.setTrafficEvent(savedEvent);
            if (payload.containsKey("driverId")) {
                dEvent.setDriverId((Integer) payload.get("driverId"));
            }
            if (payload.containsKey("cueType")) {
                dEvent.setCueType((String) payload.get("cueType"));
            }
            if (payload.containsKey("warningLevel")) {
                dEvent.setWarningLevel((String) payload.get("warningLevel"));
            }
            drowsinessRepository.save(dEvent);
        }

        return ResponseEntity.ok(savedEvent);
    }

    @GetMapping("/events")
    public ResponseEntity<List<TrafficEvent>> getRecentEvents() {
        return ResponseEntity.ok(eventRepository.findTop50ByOrderByTimestampDesc());
    }

    @GetMapping("/violations")
    public ResponseEntity<List<Violation>> getViolations() {
        return ResponseEntity.ok(violationRepository.findTop50ByOrderByIdDesc());
    }
    
    @GetMapping("/ambulances")
    public ResponseEntity<List<AmbulanceEvent>> getAmbulances() {
        return ResponseEntity.ok(ambulanceRepository.findTop50ByOrderByIdDesc());
    }

    @GetMapping("/drowsiness")
    public ResponseEntity<List<DrowsinessEvent>> getDrowsinessEvents() {
        return ResponseEntity.ok(drowsinessRepository.findTop50ByOrderByIdDesc());
    }
}
