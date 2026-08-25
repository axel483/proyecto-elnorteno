package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Categoria;
import com.elnorteno.elnorteno_backend.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public List<Categoria> listar() {
        return categoriaService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Categoria categoria) {
        try {
            Categoria nueva = categoriaService.guardar(categoria);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear la categoría: " + e.getMessage());
        }
    }

    // ✅ ACTUALIZAR categoría
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Categoria categoria) {
        try {
            Categoria actualizada = categoriaService.actualizar(id, categoria);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    // ✅ ELIMINAR categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            categoriaService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }
}