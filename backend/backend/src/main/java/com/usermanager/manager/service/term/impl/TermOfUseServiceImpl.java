package com.usermanager.manager.service.term.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.repository.term.TermOfUseRepository;
import com.usermanager.manager.service.term.TermOfUseService;

@Service
public class TermOfUseServiceImpl implements TermOfUseService {
    private final TermOfUseRepository termOfUseRepository;

    public TermOfUseServiceImpl(TermOfUseRepository termOfUseRepository) {
        this.termOfUseRepository = termOfUseRepository;
    }

    @Transactional
    public TermOfUse createTerm(String version, String content) {
        TermOfUse term = new TermOfUse();
        term.setVersion(version);
        term.setContent(content);
        return termOfUseRepository.save(term);
    }

    @Transactional
    public Optional<TermOfUse> findByVersion(String version) {
        return termOfUseRepository.findByVersion(version);
    }

    @Transactional
    public Optional<TermOfUse> findLatest() {
        return termOfUseRepository.findTopByOrderByCreatedAtDesc();
    }

    @Transactional
    public List<TermOfUse> findAll() {
        return termOfUseRepository.findAll();
    }
}
