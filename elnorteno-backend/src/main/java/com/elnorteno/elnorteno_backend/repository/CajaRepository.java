package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Caja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Integer> {
}