package com.elnorteno.elnorteno_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductoDTO {
    private Integer idProducto;
    private Integer idCategoria;
    private String nombre;
    private String descripcion;
    private Integer stockMinimo;
    private Integer stock;
    private Integer idEmpresa; // 👈 NUEVO CAMPO
    private List<PresentacionDTO> presentaciones;

    @Data
    public static class PresentacionDTO {
        private Integer idPresentacion;
        private String nombrePresentacion;
        private Integer factorConversion;
        private BigDecimal precioVenta;
    }
}