package com.usermanager.manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.message.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>{

}
