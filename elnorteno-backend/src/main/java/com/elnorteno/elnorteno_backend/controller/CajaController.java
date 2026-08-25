package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.dto.AperturaCajaDTO;
import com.elnorteno.elnorteno_backend.dto.CierreCajaDTO;
import com.elnorteno.elnorteno_backend.entity.Caja;
import com.elnorteno.elnorteno_backend.entity.SesionCaja;
import com.elnorteno.elnorteno_backend.service.CajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cajas")
@CrossOrigin(origins = "*")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    @GetMapping
    public List<Caja> listarCajas() {
        return cajaService.listarTodas();
    }

    @GetMapping("/sesiones")
    public List<SesionCaja> listarSesiones() {
        return cajaService.listarSesiones();
    }

    @PostMapping("/abrir")
    public ResponseEntity<?> abrirCaja(@RequestBody AperturaCajaDTO dto) {
        try {
            SesionCaja sesion = cajaService.abrirCaja(dto);
            return ResponseEntity.ok(sesion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarCaja(@RequestBody CierreCajaDTO dto) {
        try {
            SesionCaja sesion = cajaService.cerrarCaja(dto);
            return ResponseEntity.ok(sesion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}