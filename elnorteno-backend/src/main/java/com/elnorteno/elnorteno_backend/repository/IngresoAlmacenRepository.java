package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.IngresoAlmacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngresoAlmacenRepository extends JpaRepository<IngresoAlmacen, Integer> {
}