package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.dto.VentaDTO;
import com.elnorteno.elnorteno_backend.entity.DetalleVenta;
import com.elnorteno.elnorteno_backend.entity.Venta;
import com.elnorteno.elnorteno_backend.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @GetMapping
    public List<Venta> listar() {
        return ventaService.listarTodas();
    }

    @GetMapping("/{idVenta}/detalles")
    public List<DetalleVenta> listarDetalles(@PathVariable Integer idVenta) {
        return ventaService.listarDetallesPorVenta(idVenta);
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(@RequestBody VentaDTO dto) {
        try {
            Venta nuevaVenta = ventaService.registrarVenta(dto);
            return ResponseEntity.ok(nuevaVenta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}