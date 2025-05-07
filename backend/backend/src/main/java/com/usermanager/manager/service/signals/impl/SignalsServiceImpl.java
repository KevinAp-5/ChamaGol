package com.usermanager.manager.service.signals.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.mappers.SignalMapper;
import com.usermanager.manager.model.signal.Signal;
import com.usermanager.manager.repository.SignalsRepository;
import com.usermanager.manager.service.signals.SignalsService;

import jakarta.validation.Valid;

@Service
public class SignalsServiceImpl implements SignalsService {
    private final SignalsRepository signalsRepository;
    private final SignalMapper signalMapper;

    public SignalsServiceImpl(SignalsRepository signalsRepository, SignalMapper signalMapper) {
        this.signalsRepository = signalsRepository;
        this.signalMapper = signalMapper;
    }

    @Override
    public SignalCreated createSignal(@Valid SignalDTO data) {
        Signal signal = signalMapper.signalDTOToEntity(data);
        signal = signalsRepository.save(signal);
        return signalMapper.entityToSignalCreated(signal);
    }

    @Override
    public List<SignalDTO> getSignal() {
        return signalsRepository.findAll().stream()
            .map(signalMapper::entityToSignalDTO)
            .toList();
    }

}
