package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer idDetalle;

    @ManyToOne
    @JoinColumn(name = "id_venta", nullable = false)
    private Venta venta;

    @ManyToOne
    @JoinColumn(name = "id_presentacion", nullable = false)
    private PresentacionProducto presentacion;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_aplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAplicado;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
}