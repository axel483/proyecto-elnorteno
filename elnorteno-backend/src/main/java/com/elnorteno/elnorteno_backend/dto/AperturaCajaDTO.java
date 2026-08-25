package com.elnorteno.elnorteno_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AperturaCajaDTO {
    private Integer idCaja;
    private Integer idUsuario;
    private BigDecimal montoInicial;
}