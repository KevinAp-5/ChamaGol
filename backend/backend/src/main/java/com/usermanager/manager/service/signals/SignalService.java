package com.usermanager.manager.service.signals;

import java.util.List;

import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.model.signal.Signal;

public interface SignalService {

    public Signal createSignal(SignalDTO data);

    public List<SignalDTO> getSignal();
}
