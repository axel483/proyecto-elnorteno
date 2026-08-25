package com.elnorteno.elnorteno_backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductoDTO {
    private String nombre;
    private String descripcion;
    private Integer idCategoria;
    private Integer stockMinimo;
    private List<PresentacionDTO> presentaciones;

    public static class PresentacionDTO {
        private String nombrePresentacion;
        private Integer factorConversion;
        private BigDecimal precioVenta; // ✅ Cambiado a BigDecimal
        private Integer stockFisico;

        // Getters y Setters
        public String getNombrePresentacion() { return nombrePresentacion; }
        public void setNombrePresentacion(String nombrePresentacion) { this.nombrePresentacion = nombrePresentacion; }
        public Integer getFactorConversion() { return factorConversion; }
        public void setFactorConversion(Integer factorConversion) { this.factorConversion = factorConversion; }
        public BigDecimal getPrecioVenta() { return precioVenta; }
        public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
        public Integer getStockFisico() { return stockFisico; }
        public void setStockFisico(Integer stockFisico) { this.stockFisico = stockFisico; }
    }

    // Getters y Setters principales
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Integer idCategoria) { this.idCategoria = idCategoria; }
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
    public List<PresentacionDTO> getPresentaciones() { return presentaciones; }
    public void setPresentaciones(List<PresentacionDTO> presentaciones) { this.presentaciones = presentaciones; }
}