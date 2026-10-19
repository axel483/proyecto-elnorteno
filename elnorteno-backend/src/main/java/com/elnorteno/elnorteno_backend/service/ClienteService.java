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

    // 👇 MÉTODO PARA ACTUALIZAR (Guarda el correo y teléfono)
    public Cliente actualizar(Integer id, Cliente cliente) {
        Cliente existente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        existente.setTipoDocumento(cliente.getTipoDocumento());
        existente.setNumeroDocumento(cliente.getNumeroDocumento());
        existente.setNombreRazonSocial(cliente.getNombreRazonSocial());
        existente.setTelefono(cliente.getTelefono());
        existente.setCorreo(cliente.getCorreo());
        existente.setDireccion(cliente.getDireccion());

        return clienteRepository.save(existente);
    }

    // 👇 MÉTODO PARA ELIMINAR
    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }

    public Optional<Cliente> buscarPorDocumento(String documento) {
        // 1. Buscar en la base de datos local
        Optional<Cliente> clienteLocal = clienteRepository.findByNumeroDocumento(documento);
        if (clienteLocal.isPresent()) {
            return clienteLocal;
        }

        // 2. Consultar API externa
        Cliente clienteExterno = null;
        if (documento.length() == 8) {
            clienteExterno = consultaExternaService.consultarDNI(documento);
        } else if (documento.length() == 11) {
            clienteExterno = consultaExternaService.consultarRUC(documento);
        }

        // 3. Si se encontró, intentar guardar
        if (clienteExterno != null) {
            try {
                clienteExterno = clienteRepository.save(clienteExterno);
                return Optional.of(clienteExterno);
            } catch (Exception e) {
                // Si por alguna razón ya existe (error de duplicado), lo buscamos y lo devolvemos
                return clienteRepository.findByNumeroDocumento(documento);
            }
        }

        return Optional.empty();
    }
}