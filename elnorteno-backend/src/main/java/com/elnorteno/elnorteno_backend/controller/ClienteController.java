package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Cliente;
import com.elnorteno.elnorteno_backend.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public List<Cliente> listar(@RequestParam(required = false) Integer idEmpresa) {
        List<Cliente> clientes = clienteService.listarTodos();
        
        if (idEmpresa == null) return clientes;
        
        return clientes.stream()
                .filter(c -> c.getIdEmpresa() == null || c.getIdEmpresa().equals(idEmpresa))
                .collect(Collectors.toList());
    }

    @PostMapping
    public Cliente guardar(@RequestBody Cliente cliente) {
        return clienteService.guardar(cliente);
    }

    // 👇 NUEVO ENDPOINT: Para guardar los cambios de la edición
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Cliente cliente) {
        try {
            Cliente actualizado = clienteService.actualizar(id, cliente);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    // 👇 NUEVO ENDPOINT: Para eliminar clientes
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            clienteService.eliminar(id);
            return ResponseEntity.ok("Cliente eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
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