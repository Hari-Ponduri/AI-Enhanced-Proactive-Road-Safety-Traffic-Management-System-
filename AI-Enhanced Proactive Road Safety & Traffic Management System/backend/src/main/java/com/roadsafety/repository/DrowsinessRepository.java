package com.roadsafety.repository;

import com.roadsafety.model.DrowsinessEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrowsinessRepository extends JpaRepository<DrowsinessEvent, Long> {
    List<DrowsinessEvent> findTop50ByOrderByIdDesc();
}
