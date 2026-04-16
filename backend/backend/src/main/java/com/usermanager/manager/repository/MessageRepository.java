package com.usermanager.manager.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.message.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>{

    Page<Message> findAll(Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.id > :id ORDER BY m.createdAt ASC")
    List<Message> findByIdGreaterThanOrderByCreatedAtAsc(Long id);
}
