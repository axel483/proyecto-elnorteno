package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Empresa;
import com.elnorteno.elnorteno_backend.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    @GetMapping
    public List<Empresa> listar() {
        return empresaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(empresaService.buscarPorId(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> buscarPorSlug(@PathVariable String slug) {
        try {
            Empresa e = empresaService.buscarPorSlug(slug);
            return ResponseEntity.ok(Map.of(
                "idEmpresa", e.getIdEmpresa(),
                "nombreComercial", e.getNombreComercial(),
                "logoUrl", e.getLogoUrl() != null ? e.getLogoUrl() : "",
                "colorPrimario", e.getColorPrimario() != null ? e.getColorPrimario() : "#059669",
                "ruc", e.getRuc() != null ? e.getRuc() : "",
                "direccion", e.getDireccion() != null ? e.getDireccion() : "",
                "telefono", e.getTelefono() != null ? e.getTelefono() : "",
                "estado", e.getEstado(),
                "estaActiva", e.estaActiva()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Empresa empresa) {
        try {
            return ResponseEntity.ok(empresaService.crear(empresa));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Empresa empresa) {
        try {
            return ResponseEntity.ok(empresaService.actualizar(id, empresa));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id, @RequestParam String estado) {
        try {
            return ResponseEntity.ok(empresaService.cambiarEstado(id, estado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<?> registrarPago(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(empresaService.registrarPago(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            empresaService.eliminar(id);
            return ResponseEntity.ok("Empresa eliminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}