package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    @Column(name = "tipo_documento", length = 10)
    private String tipoDocumento; // 'DNI', 'RUC', 'VARIOS'

    @Column(name = "numero_documento", unique = true, length = 15)
    private String numeroDocumento;

    @Column(name = "nombre_razon_social", nullable = false, length = 150)
    private String nombreRazonSocial;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "correo", length = 100)
    private String correo;
    
    @Column(name = "direccion", length = 200)
    private String direccion;

    // 👇 CAMPO SAAS
    @Column(name = "id_empresa")
    private Integer idEmpresa;
}