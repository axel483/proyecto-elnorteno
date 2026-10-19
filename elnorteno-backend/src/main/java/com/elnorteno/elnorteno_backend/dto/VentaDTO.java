package com.elnorteno.elnorteno_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VentaDTO {
    private Integer idSesion;
    private Integer idCliente;
    private Integer idUsuario;
    private String metodoPago;
    private String tipoComprobante; 
    private BigDecimal montoTotal;
    
    // 👇CAMPO SAAS
    private Integer idEmpresa;
    
    private List<DetalleVentaDTO> detalles;
}