package com.usermanager.manager.service.term;

import java.util.Optional;

import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.model.term.UserTermAcceptance;
import com.usermanager.manager.model.user.User;

public interface UserTermAcceptanceService {
    public UserTermAcceptance acceptTerm(User user, TermOfUse termOfUse, Boolean isAdult);

    public boolean hasAcceptedLatestTerm(User user, TermOfUse latestTerm);

    public Optional<UserTermAcceptance> getLatestAcceptance(User user);
}
