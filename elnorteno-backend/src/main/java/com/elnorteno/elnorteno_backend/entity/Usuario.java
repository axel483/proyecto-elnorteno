package com.elnorteno.elnorteno_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    // Relación con la tabla roles (id_rol)
    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rolObj;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;

    @Column(name = "apellidos", nullable = false, length = 100)
    private String apellidos;

    // 👇 CAMPOS NUEVOS PARA EL SAAS
    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "rol", length = 20)
    private String rol;

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "id_empresa")
    private Integer idEmpresa;
    // ------------------------------------------------

    @Column(name = "estado")
    private Boolean estado = true;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}