package com.usermanager.manager.service.term;

import java.util.List;
import java.util.Optional;

import com.usermanager.manager.model.term.TermOfUse;

public interface TermOfUseService {
    public TermOfUse createTerm(String version, String content);

    public Optional<TermOfUse> findByVersion(String version);

    public Optional<TermOfUse> findLatest();

    public List<TermOfUse> findAll();
}
