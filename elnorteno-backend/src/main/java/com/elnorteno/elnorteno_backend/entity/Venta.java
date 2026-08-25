package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Integer idVenta;

    @ManyToOne
    @JoinColumn(name = "id_sesion", nullable = false)
    private SesionCaja sesionCaja;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_venta", insertable = false, updatable = false)
    private LocalDateTime fechaVenta;

    @Column(name = "metodo_pago", nullable = false, length = 20)
    private String metodoPago; // 'EFECTIVO', 'YAPE', 'MIXTO'

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;
}