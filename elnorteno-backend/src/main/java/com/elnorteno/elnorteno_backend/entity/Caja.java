package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cajas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Caja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_caja")
    private Integer idCaja;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "estado", length = 20)
    private String estado = "CERRADA";
}