package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.dto.VentaDTO;
import com.elnorteno.elnorteno_backend.entity.DetalleVenta;
import com.elnorteno.elnorteno_backend.entity.Venta;
import com.elnorteno.elnorteno_backend.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    // 👇 MODIFICADO: Recibe idEmpresa para filtrar
    @GetMapping
    public List<Venta> listar(@RequestParam(required = false) Integer idEmpresa) {
        List<Venta> ventas = ventaService.listarTodas();
        
        if (idEmpresa == null) return ventas;

        return ventas.stream()
                .filter(v -> v.getIdEmpresa() == null || v.getIdEmpresa().equals(idEmpresa))
                .collect(Collectors.toList());
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