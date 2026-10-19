package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Usuario;
import com.elnorteno.elnorteno_backend.repository.EmpresaRepository;
import com.elnorteno.elnorteno_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private EmpresaRepository empresaRepository; // 👈 NUEVO

    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.listarTodos();
    }

    @PostMapping
    public Usuario guardar(@RequestBody Usuario usuario) {
        return usuarioService.guardar(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<Usuario> usuarioOpt = usuarioService.buscarPorNombreUsuario(username);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Usuario o contraseña incorrectos."));
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Usuario o contraseña incorrectos."));
        }

        if (Boolean.FALSE.equals(usuario.getEstado())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "El usuario se encuentra inactivo."));
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idUsuario", usuario.getIdUsuario());
        respuesta.put("nombreUsuario", usuario.getNombreUsuario());
        respuesta.put("nombres", usuario.getNombres());
        respuesta.put("apellidos", usuario.getApellidos());
        respuesta.put("estado", usuario.getEstado());
        respuesta.put("nombreCompleto", usuario.getNombreCompleto() != null ? usuario.getNombreCompleto() : usuario.getNombres() + " " + usuario.getApellidos());
        respuesta.put("username", usuario.getUsername() != null ? usuario.getUsername() : usuario.getNombreUsuario());
        respuesta.put("idEmpresa", usuario.getIdEmpresa());
        
        String rolString = usuario.getRol() != null ? usuario.getRol() : "ADMIN";
        respuesta.put("rol", rolString.toUpperCase());

        // 👇 LÓGICA SAAS: Agregar datos de la empresa al login
        if (usuario.getIdEmpresa() != null) {
            empresaRepository.findById(usuario.getIdEmpresa()).ifPresent(empresa -> {
                respuesta.put("nombreEmpresa", empresa.getNombreComercial());
                respuesta.put("colorEmpresa", empresa.getColorPrimario());
                respuesta.put("logoEmpresa", empresa.getLogoUrl());
            });
        }

        return ResponseEntity.ok(respuesta);
    }
}