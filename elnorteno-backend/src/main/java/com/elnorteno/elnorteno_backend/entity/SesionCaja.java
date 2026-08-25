package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones_caja")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SesionCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Integer idSesion;

    @ManyToOne
    @JoinColumn(name = "id_caja", nullable = false)
    private Caja caja;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "monto_inicial", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoInicial;

    @Column(name = "monto_final", precision = 10, scale = 2)
    private BigDecimal montoFinal;

    @Column(name = "monto_efectivo", precision = 10, scale = 2)
    private BigDecimal montoEfectivo = BigDecimal.ZERO;

    @Column(name = "monto_yape", precision = 10, scale = 2)
    private BigDecimal montoYape = BigDecimal.ZERO;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "estado", length = 20)
    private String estado = "ABIERTA";
}