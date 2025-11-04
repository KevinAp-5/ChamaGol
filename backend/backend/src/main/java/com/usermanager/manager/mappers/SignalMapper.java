package com.usermanager.manager.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.model.signal.Signal;

import java.time.ZonedDateTime;
import java.time.ZoneId;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SignalMapper {

    Signal signalDTOToEntity(SignalDTO data);
    SignalDTO entityToSignalDTO(Signal data);
    Signal signalCreatedToEntity(SignalCreated data);
    SignalCreated entityToSignalCreated(Signal data);

    default ZonedDateTime map(Integer days) {
        if (days == null) return null;
        return ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")).plusDays(days);
    }

    default Integer map(ZonedDateTime dateTime) {
        if (dateTime == null) return null;
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/Sao_Paulo"));
        return (int) java.time.Duration.between(now, dateTime).toDays();
    }
}
