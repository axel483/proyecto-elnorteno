package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {
    List<DetalleVenta> findByVentaIdVenta(Integer idVenta);
    
    // 👇 verificar si una presentación tiene ventas asociadas
    boolean existsByPresentacionIdPresentacion(Integer idPresentacion);
}