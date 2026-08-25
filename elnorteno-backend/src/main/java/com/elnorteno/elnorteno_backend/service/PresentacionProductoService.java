package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.PresentacionProducto;
import com.elnorteno.elnorteno_backend.repository.PresentacionProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PresentacionProductoService {

    @Autowired
    private PresentacionProductoRepository presentacionRepository;

    public PresentacionProducto actualizar(Integer id, PresentacionProducto presentacion) {
        Optional<PresentacionProducto> optional = presentacionRepository.findById(id);
        if (optional.isEmpty()) {
            throw new RuntimeException("Presentación no encontrada");
        }
        PresentacionProducto existente = optional.get();
        // Actualizar solo los campos permitidos
        if (presentacion.getNombrePresentacion() != null) {
            existente.setNombrePresentacion(presentacion.getNombrePresentacion());
        }
        if (presentacion.getFactorConversion() != null) {
            existente.setFactorConversion(presentacion.getFactorConversion());
        }
        if (presentacion.getPrecioVenta() != null) {
            existente.setPrecioVenta(presentacion.getPrecioVenta());
        }
        if (presentacion.getStockFisico() != null) {
            existente.setStockFisico(presentacion.getStockFisico());
        }
        return presentacionRepository.save(existente);
    }
}