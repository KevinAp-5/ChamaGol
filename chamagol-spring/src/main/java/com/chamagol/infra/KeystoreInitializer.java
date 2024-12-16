package com.chamagol.infra;

import java.io.FileOutputStream;
import java.util.Base64;

import org.springframework.context.annotation.Configuration;

@Configuration
public class KeystoreInitializer {

    static {
        try {
            // Recupera a variável de ambiente KEYSTORE_BASE64
            String keystoreBase64 = System.getenv("KEYSTORE_BASE64");

            if (keystoreBase64 == null || keystoreBase64.isEmpty()) {
                throw new RuntimeException("Variável de ambiente KEYSTORE_BASE64 não encontrada!");
            }

            // Decodifica a string Base64 para bytes
            byte[] keystoreBytes = Base64.getDecoder().decode(keystoreBase64);

            // Salva o arquivo decodificado localmente
            try (FileOutputStream fos = new FileOutputStream("keystore.p12")) {
                fos.write(keystoreBytes);
                System.out.println("Arquivo keystore.p12 recriado com sucesso!");
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao recriar o arquivo keystore.p12 a partir da variável de ambiente", e);
        }
    }
}
