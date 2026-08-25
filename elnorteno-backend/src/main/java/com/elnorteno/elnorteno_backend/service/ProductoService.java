package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.dto.ProductoDTO;
import com.elnorteno.elnorteno_backend.entity.*;
import com.elnorteno.elnorteno_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private PresentacionProductoRepository presentacionRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public List<PresentacionProducto> listarPresentaciones() {
        return presentacionRepository.findAll();
    }

    @Transactional
    public Producto guardarConPresentacion(ProductoDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Producto producto = new Producto();
        producto.setCategoria(categoria);
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 5);
        producto.setEstado(true);

        Producto productoGuardado = productoRepository.save(producto);

        if (dto.getPresentaciones() != null && !dto.getPresentaciones().isEmpty()) {
            for (ProductoDTO.PresentacionDTO presDTO : dto.getPresentaciones()) {
                PresentacionProducto pres = new PresentacionProducto();
                pres.setProducto(productoGuardado);
                pres.setNombrePresentacion(presDTO.getNombrePresentacion());
                pres.setFactorConversion(presDTO.getFactorConversion());
                pres.setPrecioVenta(presDTO.getPrecioVenta());
                pres.setStockFisico(presDTO.getStockFisico());
                presentacionRepository.save(pres);
            }
        }

        return productoGuardado;
    }

    @Transactional
    public Producto actualizarConPresentaciones(Integer id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        producto.setCategoria(categoria);
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 5);

        // Usamos el método corregido
        List<PresentacionProducto> existentes = presentacionRepository.findByProductoIdProducto(id);
        presentacionRepository.deleteAll(existentes);

        if (dto.getPresentaciones() != null && !dto.getPresentaciones().isEmpty()) {
            for (ProductoDTO.PresentacionDTO presDTO : dto.getPresentaciones()) {
                PresentacionProducto pres = new PresentacionProducto();
                pres.setProducto(producto);
                pres.setNombrePresentacion(presDTO.getNombrePresentacion());
                pres.setFactorConversion(presDTO.getFactorConversion());
                pres.setPrecioVenta(presDTO.getPrecioVenta());
                pres.setStockFisico(presDTO.getStockFisico());
                presentacionRepository.save(pres);
            }
        }

        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminar(Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        // Usamos el método corregido
        List<PresentacionProducto> presentaciones = presentacionRepository.findByProductoIdProducto(id);
        presentacionRepository.deleteAll(presentaciones);
        productoRepository.delete(producto);
    }

    @Transactional
    public PresentacionProducto actualizarPresentacion(Integer id, PresentacionProducto presentacion) {
        PresentacionProducto existente = presentacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presentación no encontrada"));
        if (presentacion.getStockFisico() != null) {
            existente.setStockFisico(presentacion.getStockFisico());
        }
        if (presentacion.getPrecioVenta() != null) {
            existente.setPrecioVenta(presentacion.getPrecioVenta());
        }
        if (presentacion.getNombrePresentacion() != null) {
            existente.setNombrePresentacion(presentacion.getNombrePresentacion());
        }
        if (presentacion.getFactorConversion() != null) {
            existente.setFactorConversion(presentacion.getFactorConversion());
        }
        return presentacionRepository.save(existente);
    }
}