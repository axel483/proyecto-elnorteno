package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.Categoria;
import com.elnorteno.elnorteno_backend.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> listarTodos() {
        return categoriaRepository.findAll();
    }

    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public Categoria actualizar(Integer id, Categoria categoria) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        existente.setNombre(categoria.getNombre());
        existente.setDescripcion(categoria.getDescripcion());
        return categoriaRepository.save(existente);
    }

    @Transactional
    public void eliminar(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        // Si tienes productos asociados, puedes eliminarlos en cascada o lanzar excepción
        categoriaRepository.delete(categoria);
    }
}