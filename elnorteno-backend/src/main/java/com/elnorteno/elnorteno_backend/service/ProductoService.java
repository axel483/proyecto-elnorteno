package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.dto.ProductoDTO;
import com.elnorteno.elnorteno_backend.entity.*;
import com.elnorteno.elnorteno_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private PresentacionProductoRepository presentacionRepository;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAllWithPresentaciones();
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
        producto.setStock(dto.getStock() != null ? dto.getStock() : 0);
        
        // 👇 ASIGNAR EL ID DE LA EMPRESA (Si no viene, se le asigna 1 por defecto)
        producto.setIdEmpresa(dto.getIdEmpresa() != null ? dto.getIdEmpresa() : 1);
        
        producto.setEstado(true);

        Producto productoGuardado = productoRepository.save(producto);

        if (dto.getPresentaciones() != null && !dto.getPresentaciones().isEmpty()) {
            for (ProductoDTO.PresentacionDTO presDTO : dto.getPresentaciones()) {
                PresentacionProducto pres = new PresentacionProducto();
                pres.setProducto(productoGuardado);
                pres.setNombrePresentacion(presDTO.getNombrePresentacion());
                pres.setFactorConversion(presDTO.getFactorConversion());
                pres.setPrecioVenta(presDTO.getPrecioVenta());
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
        producto.setStock(dto.getStock() != null ? dto.getStock() : 0);

        List<PresentacionProducto> existentes = presentacionRepository.findByProductoIdProducto(id);
        Map<Integer, PresentacionProducto> mapaExistentes = existentes.stream()
                .collect(Collectors.toMap(PresentacionProducto::getIdPresentacion, p -> p));

        List<Integer> idsDTO = new ArrayList<>();

        if (dto.getPresentaciones() != null && !dto.getPresentaciones().isEmpty()) {
            for (ProductoDTO.PresentacionDTO presDTO : dto.getPresentaciones()) {
                if (presDTO.getIdPresentacion() != null && mapaExistentes.containsKey(presDTO.getIdPresentacion())) {
                    PresentacionProducto pres = mapaExistentes.get(presDTO.getIdPresentacion());
                    pres.setNombrePresentacion(presDTO.getNombrePresentacion());
                    pres.setFactorConversion(presDTO.getFactorConversion());
                    pres.setPrecioVenta(presDTO.getPrecioVenta());
                    presentacionRepository.save(pres);
                    idsDTO.add(presDTO.getIdPresentacion());
                } else {
                    PresentacionProducto nuevaPres = new PresentacionProducto();
                    nuevaPres.setProducto(producto);
                    nuevaPres.setNombrePresentacion(presDTO.getNombrePresentacion());
                    nuevaPres.setFactorConversion(presDTO.getFactorConversion());
                    nuevaPres.setPrecioVenta(presDTO.getPrecioVenta());
                    presentacionRepository.save(nuevaPres);
                    idsDTO.add(nuevaPres.getIdPresentacion());
                }
            }
        }

        for (PresentacionProducto existente : existentes) {
            if (!idsDTO.contains(existente.getIdPresentacion())) {
                boolean tieneVentas = detalleVentaRepository.existsByPresentacionIdPresentacion(existente.getIdPresentacion());
                if (!tieneVentas) {
                    presentacionRepository.delete(existente);
                }
            }
        }

        return productoRepository.save(producto);
    }

    private boolean tieneVentasAsociadas(Integer idPresentacion) {
        return detalleVentaRepository.existsByPresentacionIdPresentacion(idPresentacion);
    }

    @Transactional
    public void eliminar(Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        List<PresentacionProducto> presentaciones = presentacionRepository.findByProductoIdProducto(id);
        for (PresentacionProducto pres : presentaciones) {
            if (!tieneVentasAsociadas(pres.getIdPresentacion())) {
                presentacionRepository.delete(pres);
            }
        }
        
        producto.setEstado(false);
        productoRepository.save(producto);
    }

    @Transactional
    public PresentacionProducto actualizarPresentacion(Integer id, PresentacionProducto presentacion) {
        PresentacionProducto existente = presentacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presentación no encontrada"));
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