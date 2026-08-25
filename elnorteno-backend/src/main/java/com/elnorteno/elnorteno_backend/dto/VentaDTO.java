package com.elnorteno.elnorteno_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VentaDTO {
    private Integer idSesion;
    private Integer idCliente;
    private Integer idUsuario;
    private String metodoPago; // 'EFECTIVO', 'YAPE', 'MIXTO'
    private BigDecimal montoTotal;
    
    // Datos para el Comprobante
    private String tipoComprobante; // 'COTIZACION', 'NOTA_VENTA', 'BOLETA'
    private String serie;
    private String numero;
    private String formatoImpresion; // 'TICKET_80MM', 'A4'

    private List<DetalleVentaDTO> detalles;
}