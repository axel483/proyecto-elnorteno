package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByCategoriaIdCategoria(Integer idCategoria);
}