package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    Optional<Proveedor> findByRuc(String ruc);
}
