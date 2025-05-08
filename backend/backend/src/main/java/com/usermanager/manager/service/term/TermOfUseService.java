package com.usermanager.manager.service.term;

import java.util.List;

import com.usermanager.manager.model.term.TermOfUse;

public interface TermOfUseService {
    public TermOfUse createTerm(String version, String content);

    public TermOfUse findByVersion(String version);
    public TermOfUse findLatest();

    public List<TermOfUse> findAll();
}
