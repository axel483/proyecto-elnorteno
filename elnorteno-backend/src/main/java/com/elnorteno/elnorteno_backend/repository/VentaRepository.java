package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    List<Venta> findBySesionCajaIdSesion(Integer idSesion);
}
