package com.elnorteno.elnorteno_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleVentaDTO {
    private Integer idPresentacion;
    private Integer cantidad;
    private BigDecimal precioAplicado; // Permite ajuste de precio en caja para "caseritos"
}