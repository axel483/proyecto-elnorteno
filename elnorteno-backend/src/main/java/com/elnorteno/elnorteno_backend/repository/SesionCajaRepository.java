package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.SesionCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SesionCajaRepository extends JpaRepository<SesionCaja, Integer> {
    Optional<SesionCaja> findByCajaIdCajaAndEstado(Integer idCaja, String estado);
}