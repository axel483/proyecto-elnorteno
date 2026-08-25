package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Cliente;
import com.elnorteno.elnorteno_backend.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public List<Cliente> listar() {
        return clienteService.listarTodos();
    }

    @PostMapping
    public Cliente guardar(@RequestBody Cliente cliente) {
        return clienteService.guardar(cliente);
    }

    @GetMapping("/buscar")
    public ResponseEntity<Cliente> buscarPorDocumento(@RequestParam String documento) {
        Optional<Cliente> clienteOpt = clienteService.buscarPorDocumento(documento);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clienteOpt.get());
    }
}