package com.elnorteno.elnorteno_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CierreCajaDTO {
    private Integer idSesion;
    private BigDecimal montoFinal;
}