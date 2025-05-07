package com.usermanager.manager.service.signals;

import java.util.List;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;

public interface SignalService {

    public SignalCreated createSignal(SignalDTO data);

    public List<SignalDTO> getSignal();
}
