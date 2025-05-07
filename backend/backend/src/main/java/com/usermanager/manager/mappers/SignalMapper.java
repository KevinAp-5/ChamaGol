package com.usermanager.manager.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.model.signal.Signal;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SignalMapper {

    Signal signalDTOToEntity(SignalDTO data);
    SignalDTO entityToSignalDTO(Signal data);
    Signal signalCreatedToEntity(SignalCreated data);
    SignalCreated entityToSignalCreated(Signal data);
}
