package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.PresentacionProducto;
import com.elnorteno.elnorteno_backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/presentaciones")
@CrossOrigin(origins = "*")
public class PresentacionController {

    @Autowired
    private ProductoService productoService;

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarStock(@PathVariable Integer id, @RequestBody PresentacionProducto presentacion) {
        try {
            PresentacionProducto actualizada = productoService.actualizarPresentacion(id, presentacion);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar stock: " + e.getMessage());
        }
    }
}