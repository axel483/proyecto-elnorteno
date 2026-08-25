package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);
}