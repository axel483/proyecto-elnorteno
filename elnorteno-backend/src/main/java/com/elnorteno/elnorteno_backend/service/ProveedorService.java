package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.Proveedor;
import com.elnorteno.elnorteno_backend.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    public Proveedor guardar(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }
}
