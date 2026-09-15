package com.roadsafety.repository;

import com.roadsafety.model.AmbulanceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AmbulanceRepository extends JpaRepository<AmbulanceEvent, Long> {
    List<AmbulanceEvent> findTop50ByOrderByIdDesc();
}
