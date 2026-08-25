package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Comprobante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ComprobanteRepository extends JpaRepository<Comprobante, Integer> {
    Optional<Comprobante> findByVentaIdVenta(Integer idVenta);
}
