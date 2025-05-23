package com.usermanager.manager.infra.config;

import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class FirebaseConfig {
    @Value("${firebase.file.path}")
    private String FILE_PATH;

    @PostConstruct
    public void initialize() throws IOException {
        log.info(FILE_PATH);
        FileInputStream serviceAccount = new FileInputStream(FILE_PATH);

        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();
        
        FirebaseApp.initializeApp(options);
    }
}
