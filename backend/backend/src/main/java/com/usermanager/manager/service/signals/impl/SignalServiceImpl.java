package com.usermanager.manager.service.signals.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.mappers.SignalMapper;
import com.usermanager.manager.model.signal.Signal;
import com.usermanager.manager.repository.SignalRepository;
import com.usermanager.manager.service.signals.SignalService;

import jakarta.validation.Valid;

@Service
public class SignalServiceImpl implements SignalService {
    private final SignalRepository signalsRepository;
    private final SignalMapper signalMapper;

    public SignalServiceImpl(SignalRepository signalsRepository, SignalMapper signalMapper) {
        this.signalsRepository = signalsRepository;
        this.signalMapper = signalMapper;
    }

    @Override
    public Signal createSignal(@Valid SignalDTO data) {
        Signal signal = signalMapper.signalDTOToEntity(data);
        return signalsRepository.save(signal);
    }

    @Override
    public List<SignalDTO> getSignal() {
        return signalsRepository.findAll().stream()
            .map(signalMapper::entityToSignalDTO)
            .toList();
    }

}
