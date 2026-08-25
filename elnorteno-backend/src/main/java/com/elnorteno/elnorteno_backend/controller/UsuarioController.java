package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Usuario;
import com.elnorteno.elnorteno_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

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

        // Buscamos usando el método del repository
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorNombreUsuario(username);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // Comparamos password y usamos getEstado() que genera Lombok
            if (usuario.getPassword().equals(password)) {
                if (Boolean.FALSE.equals(usuario.getEstado())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("mensaje", "El usuario se encuentra inactivo."));
                }
                return ResponseEntity.ok(usuario);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("mensaje", "Usuario o contraseña incorrectos."));
    }
}