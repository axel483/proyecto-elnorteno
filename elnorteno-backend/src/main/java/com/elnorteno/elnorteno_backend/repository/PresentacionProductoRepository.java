package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.PresentacionProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresentacionProductoRepository extends JpaRepository<PresentacionProducto, Integer> {
    List<PresentacionProducto> findByProductoIdProducto(Integer idProducto);
}