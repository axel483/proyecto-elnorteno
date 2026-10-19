package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.PresentacionProducto;
import com.elnorteno.elnorteno_backend.repository.PresentacionProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PresentacionProductoService {

    @Autowired
    private PresentacionProductoRepository presentacionRepository;

    public PresentacionProducto actualizar(Integer id, PresentacionProducto presentacion) {
        PresentacionProducto existente = presentacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presentación no encontrada"));

        if (presentacion.getNombrePresentacion() != null) {
            existente.setNombrePresentacion(presentacion.getNombrePresentacion());
        }
        if (presentacion.getFactorConversion() != null) {
            existente.setFactorConversion(presentacion.getFactorConversion());
        }
        if (presentacion.getPrecioVenta() != null) {
            existente.setPrecioVenta(presentacion.getPrecioVenta());
        }

        return presentacionRepository.save(existente);
    }
}