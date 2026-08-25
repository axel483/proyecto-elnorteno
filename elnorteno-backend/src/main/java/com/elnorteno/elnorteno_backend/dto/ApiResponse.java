package com.elnorteno.elnorteno_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiResponse {
    private String dni;
    private String nombres;
    @JsonProperty("apellido_paterno")
    private String apellidoPaterno;
    @JsonProperty("apellido_materno")
    private String apellidoMaterno;
    @JsonProperty("razon_social")
    private String razonSocial;
    private String direccion;

    // Getters y Setters (igual que antes)
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}