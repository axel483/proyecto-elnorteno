package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
}