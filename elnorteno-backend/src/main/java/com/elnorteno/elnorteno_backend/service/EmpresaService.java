package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.Empresa;
import com.elnorteno.elnorteno_backend.entity.Rol;
import com.elnorteno.elnorteno_backend.entity.Usuario;
import com.elnorteno.elnorteno_backend.repository.EmpresaRepository;
import com.elnorteno.elnorteno_backend.repository.RolRepository;
import com.elnorteno.elnorteno_backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository; // 👈 NUEVO REPOSITORIO

    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Integer id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
    }

    public Empresa buscarPorSlug(String slug) {
        return empresaRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
    }

    @Transactional
    public Empresa crear(Empresa empresa) {
        if (empresaRepository.existsBySlug(empresa.getSlug())) {
            throw new RuntimeException("El slug ya está en uso por otra empresa");
        }

        // 1. Configurar datos de la empresa
        empresa.setFechaInicio(LocalDate.now());
        empresa.setFechaVencimiento(LocalDate.now().plusDays(7)); // 7 días de prueba
        empresa.setEstado("PRUEBA");
        Empresa empresaGuardada = empresaRepository.save(empresa);

        // 2. Crear el usuario administrador para esta empresa
        if (usuarioRepository.findByNombreUsuario(empresa.getSlug()).isEmpty()) {
            
            // 👇 BUSCAMOS EL ROL EN LA BASE DE DATOS
            Rol rolAdmin = rolRepository.findById(1).orElse(null);

            Usuario admin = new Usuario();
            admin.setRolObj(rolAdmin); // 👈 Asignamos el objeto Rol
            admin.setIdEmpresa(empresaGuardada.getIdEmpresa());
            admin.setNombreUsuario(empresa.getSlug());
            admin.setUsername(empresa.getSlug());
            admin.setPassword("123456");
            admin.setNombres(empresa.getNombreComercial());
            admin.setApellidos("Admin");
            admin.setNombreCompleto(empresa.getNombreComercial() + " Admin");
            admin.setRol("ADMIN"); // 👈 El campo de texto que agregamos
            admin.setEstado(true);

            usuarioRepository.save(admin);
        }

        return empresaGuardada;
    }

    public Empresa actualizar(Integer id, Empresa empresa) {
        Empresa existente = buscarPorId(id);
        existente.setRazonSocial(empresa.getRazonSocial());
        existente.setNombreComercial(empresa.getNombreComercial());
        existente.setLogoUrl(empresa.getLogoUrl());
        existente.setColorPrimario(empresa.getColorPrimario());
        existente.setDireccion(empresa.getDireccion());
        existente.setTelefono(empresa.getTelefono());
        existente.setEmailAdmin(empresa.getEmailAdmin());
        existente.setNotas(empresa.getNotas());
        return empresaRepository.save(existente);
    }

    public Empresa cambiarEstado(Integer id, String nuevoEstado) {
        Empresa empresa = buscarPorId(id);
        empresa.setEstado(nuevoEstado);
        return empresaRepository.save(empresa);
    }

    public Empresa registrarPago(Integer id) {
        Empresa empresa = buscarPorId(id);
        empresa.setUltimoPago(LocalDate.now());
        empresa.setFechaVencimiento(LocalDate.now().plusDays(30)); // 30 días más
        empresa.setEstado("ACTIVO");
        return empresaRepository.save(empresa);
    }

    public void eliminar(Integer id) {
        empresaRepository.deleteById(id);
    }
}