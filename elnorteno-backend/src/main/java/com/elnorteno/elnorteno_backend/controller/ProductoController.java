package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.dto.ProductoDTO;
import com.elnorteno.elnorteno_backend.entity.PresentacionProducto;
import com.elnorteno.elnorteno_backend.entity.Producto;
import com.elnorteno.elnorteno_backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // 👇 MODIFICADO: Recibe idEmpresa para filtrar
    @GetMapping
    public List<ProductoDTO> listar(@RequestParam(required = false) Integer idEmpresa) {
        List<Producto> productos = productoService.listarTodos();
        return productos.stream()
                .filter(Producto::getEstado)
                // Filtro SaaS: Si el producto tiene empresa, debe coincidir. (Si es null, se muestra por retrocompatibilidad).
                .filter(p -> idEmpresa == null || p.getIdEmpresa() == null || p.getIdEmpresa().equals(idEmpresa))
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    private ProductoDTO convertirADTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setIdProducto(producto.getIdProducto());
        dto.setIdCategoria(producto.getCategoria().getIdCategoria());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setStockMinimo(producto.getStockMinimo());
        dto.setStock(producto.getStock());

        if (producto.getPresentaciones() != null && !producto.getPresentaciones().isEmpty()) {
            dto.setPresentaciones(
                producto.getPresentaciones().stream()
                    .map(pres -> {
                        ProductoDTO.PresentacionDTO presDTO = new ProductoDTO.PresentacionDTO();
                        presDTO.setIdPresentacion(pres.getIdPresentacion());
                        presDTO.setNombrePresentacion(pres.getNombrePresentacion());
                        presDTO.setFactorConversion(pres.getFactorConversion());
                        presDTO.setPrecioVenta(pres.getPrecioVenta());
                        return presDTO;
                    })
                    .collect(Collectors.toList())
            );
        }

        return dto;
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
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ProductoDTO dto) {
        try {
            Producto actualizado = productoService.actualizarConPresentaciones(id, dto);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.ok("Producto desactivado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al desactivar: " + e.getMessage());
        }
    }
}