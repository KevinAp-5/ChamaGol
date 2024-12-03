package com.chamagol.dto.sinal.mapper;

import org.springframework.stereotype.Component;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.model.Sinal;

@Component
public class SinalMapper {
    public Sinal toEntity(SinalDTO sinalDTO) {
        if (sinalDTO == null) {
            return null;
        }

        Sinal sinal = new Sinal();
        if (sinalDTO.id() != null) {
            sinal.setId(sinalDTO.id());
        }

        sinal.setCampeonato(sinalDTO.campeonato());
        sinal.setNomeTimes(sinalDTO.nomeTimes());
        sinal.setTempoPartida(sinalDTO.tempoPartida());
        sinal.setPlacar(sinalDTO.placar());
        sinal.setAcaoSinal(sinalDTO.acaoSinal());
        sinal.setCreatedAt(sinalDTO.created_at());
        sinal.setTipoEvento(sinalDTO.tipoEvento());

        return sinal;
    }

    public SinalDTO toDTO(Sinal sinal) {
        if (sinal == null) {
            return null;
        }

        if (sinal.getTipoEvento() == null) {
            throw new IllegalArgumentException("Tipo evento não pode ser nulo.");
        }

        return new SinalDTO(sinal);
    }
}
