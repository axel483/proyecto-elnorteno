package com.elnorteno.elnorteno_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync  // 👈 NUEVO: Habilita el envío asíncrono de correos
public class ElnortenoBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElnortenoBackendApplication.class, args);
    }

}