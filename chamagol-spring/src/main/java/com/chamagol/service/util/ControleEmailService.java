package com.chamagol.service.util;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.model.ControleEmail;
import com.chamagol.model.Usuario;
import com.chamagol.repository.ControleEmailRepository;

@Service
public class ControleEmailService {
    private ControleEmailRepository controleEmailRepository;

    public ControleEmailService(ControleEmailRepository controleEmailRepository) {
        this.controleEmailRepository = controleEmailRepository;
    }

    @Transactional
    public ControleEmail setControleEmail(Usuario usuario) {
        ControleEmail email = getControleEmail(usuario.getId());
        email.setQuantidadeEmails(email.getQuantidadeEmails() + 1);
        email.setUltimoEmail(LocalDateTime.now().toInstant(ZoneOffset.of("-03:00")));
        return controleEmailRepository.save(email);
    }

    public ControleEmail getControleEmail(Long id) {
        ControleEmail email = controleEmailRepository.findByIdUsuario(id).orElse(new ControleEmail());

        if (email.getIdUsuario() == null) {
            email.setIdUsuario(id);
        }

        if (email.getQuantidadeEmails() == null) {
            email.setQuantidadeEmails(0L);
        }
        return controleEmailRepository.save(email);
    } 
}
