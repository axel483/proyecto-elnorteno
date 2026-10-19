package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "empresas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Integer idEmpresa;

    @Column(name = "ruc", unique = true, length = 11)
    private String ruc;

    @Column(name = "razon_social", nullable = false, length = 200)
    private String razonSocial;

    @Column(name = "nombre_comercial", nullable = false, length = 100)
    private String nombreComercial;

    @Column(name = "slug", unique = true, nullable = false, length = 50)
    private String slug;

    @Column(name = "logo_url", length = 300)
    private String logoUrl;

    @Column(name = "color_primario", length = 10)
    private String colorPrimario = "#059669";

    @Column(name = "direccion", length = 200)
    private String direccion;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "email_admin", length = 100)
    private String emailAdmin;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "estado", length = 20)
    private String estado = "PRUEBA"; // PRUEBA, ACTIVO, SUSPENDIDO

    @Column(name = "monto_mensual", precision = 10, scale = 2)
    private BigDecimal montoMensual = new BigDecimal("150.00");

    @Column(name = "ultimo_pago")
    private LocalDate ultimoPago;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    // Método auxiliar
    public boolean estaActiva() {
        if ("SUSPENDIDO".equals(estado)) return false;
        if (fechaVencimiento == null) return true;
        return !LocalDate.now().isAfter(fechaVencimiento);
    }
}