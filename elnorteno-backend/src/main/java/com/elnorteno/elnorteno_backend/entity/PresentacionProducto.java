package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "presentaciones_producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresentacionProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_presentacion")
    private Integer idPresentacion;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "nombre_presentacion", nullable = false, length = 50)
    private String nombrePresentacion;

    @Column(name = "factor_conversion", nullable = false)
    private Integer factorConversion = 1;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "stock_fisico", nullable = false)
    private Integer stockFisico = 0;
}
