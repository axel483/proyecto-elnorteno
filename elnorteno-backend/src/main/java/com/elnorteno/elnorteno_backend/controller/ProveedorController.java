package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Cliente;
import com.elnorteno.elnorteno_backend.entity.Proveedor;
import com.elnorteno.elnorteno_backend.service.ConsultaExternaService;
import com.elnorteno.elnorteno_backend.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @Autowired
    private ConsultaExternaService consultaExternaService;

    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Proveedor proveedor) {
        try {
            Proveedor nuevo = proveedorService.guardar(proveedor);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Proveedor proveedor) {
        try {
            Proveedor actualizado = proveedorService.actualizar(id, proveedor);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            proveedorService.eliminar(id);
            return ResponseEntity.ok("Proveedor eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }

    // 👇 Consultar RUC en SUNAT
    @GetMapping("/buscar-ruc")
    public ResponseEntity<?> buscarRuc(@RequestParam String numero) {
        if (numero == null || numero.length() != 11) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El RUC debe tener 11 dígitos"));
        }

        try {
            Cliente datosSunat = consultaExternaService.consultarRUC(numero);

            if (datosSunat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "RUC no encontrado en SUNAT"));
            }

            return ResponseEntity.ok(Map.of(
                    "ruc", datosSunat.getNumeroDocumento(),
                    "razonSocial", datosSunat.getNombreRazonSocial() != null ? datosSunat.getNombreRazonSocial() : "",
                    "direccion", datosSunat.getDireccion() != null ? datosSunat.getDireccion() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al consultar SUNAT: " + e.getMessage()));
        }
    }
}