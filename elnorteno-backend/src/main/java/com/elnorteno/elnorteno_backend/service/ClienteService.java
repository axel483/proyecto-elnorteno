package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.Cliente;
import com.elnorteno.elnorteno_backend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ConsultaExternaService consultaExternaService;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Optional<Cliente> buscarPorDocumento(String documento) {
        // 1. Buscar en la base de datos local
        Optional<Cliente> clienteLocal = clienteRepository.findByNumeroDocumento(documento);
        if (clienteLocal.isPresent()) {
            return clienteLocal;
        }

        // 2. Consultar API externa (PeruAPI)
        Cliente clienteExterno = null;
        if (documento.length() == 8) {
            clienteExterno = consultaExternaService.consultarDNI(documento);
        } else if (documento.length() == 11) {
            clienteExterno = consultaExternaService.consultarRUC(documento);
        }

        // 3. Si se encontró, guardar en BD y devolver
        if (clienteExterno != null) {
            clienteExterno = clienteRepository.save(clienteExterno);
            return Optional.of(clienteExterno);
        }

        return Optional.empty();
    }
}