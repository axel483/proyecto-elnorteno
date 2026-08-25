package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "comprobantes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comprobante")
    private Integer idComprobante;

    @OneToOne
    @JoinColumn(name = "id_venta", nullable = false, unique = true)
    private Venta venta;

    @Column(name = "tipo_comprobante", nullable = false, length = 20)
    private String tipoComprobante; // 'COTIZACION', 'NOTA_VENTA', 'BOLETA'

    @Column(name = "serie", length = 10)
    private String serie;

    @Column(name = "numero", length = 20)
    private String numero;

    @Column(name = "estado_sunat", length = 50)
    private String estadoSunat = "NO_ENVIADO";

    @Column(name = "formato_impresion", length = 20)
    private String formatoImpresion = "TICKET_80MM";

    @Column(name = "fecha_emision", insertable = false, updatable = false)
    private LocalDateTime fechaEmision;
}