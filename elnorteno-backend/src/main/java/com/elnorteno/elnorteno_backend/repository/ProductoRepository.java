package com.elnorteno.elnorteno_backend.repository;

import com.elnorteno.elnorteno_backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // 👇 Método que carga productos con sus presentaciones en una sola consulta
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.presentaciones")
    List<Producto> findAllWithPresentaciones();

    // Método existente (opcional)
    List<Producto> findByCategoriaIdCategoria(Integer idCategoria);
}