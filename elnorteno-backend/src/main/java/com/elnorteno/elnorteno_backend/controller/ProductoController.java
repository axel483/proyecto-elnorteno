package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.dto.ProductoDTO;
import com.elnorteno.elnorteno_backend.entity.PresentacionProducto;
import com.elnorteno.elnorteno_backend.entity.Producto;
import com.elnorteno.elnorteno_backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<Producto> listar() {
        return productoService.listarTodos();
    }

    @GetMapping("/presentaciones")
    public List<PresentacionProducto> listarPresentaciones() {
        return productoService.listarPresentaciones();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody ProductoDTO dto) {
        try {
            Producto nuevo = productoService.guardarConPresentacion(dto);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ACTUALIZAR producto (con sus presentaciones)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ProductoDTO dto) {
        try {
            Producto actualizado = productoService.actualizarConPresentaciones(id, dto);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    // ✅ ELIMINAR producto
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }
}