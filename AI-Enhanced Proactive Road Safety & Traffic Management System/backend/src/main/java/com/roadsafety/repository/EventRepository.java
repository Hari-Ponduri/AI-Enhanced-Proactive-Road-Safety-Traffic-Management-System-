package com.roadsafety.repository;

import com.roadsafety.model.TrafficEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<TrafficEvent, Long> {
    List<TrafficEvent> findTop50ByOrderByTimestampDesc();
}
