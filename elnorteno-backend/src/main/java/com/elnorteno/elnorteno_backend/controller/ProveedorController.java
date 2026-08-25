package com.elnorteno.elnorteno_backend.controller;

import com.elnorteno.elnorteno_backend.entity.Proveedor;
import com.elnorteno.elnorteno_backend.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listarTodos();
    }

    @PostMapping
    public Proveedor guardar(@RequestBody Proveedor proveedor) {
        return proveedorService.guardar(proveedor);
    }
}
