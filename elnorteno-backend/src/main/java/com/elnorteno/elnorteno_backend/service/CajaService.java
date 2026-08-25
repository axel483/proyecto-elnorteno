package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.dto.AperturaCajaDTO;
import com.elnorteno.elnorteno_backend.dto.CierreCajaDTO;
import com.elnorteno.elnorteno_backend.entity.*;
import com.elnorteno.elnorteno_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CajaService {

    @Autowired
    private CajaRepository cajaRepository;

    @Autowired
    private SesionCajaRepository sesionCajaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Caja> listarTodas() {
        return cajaRepository.findAll();
    }

    public List<SesionCaja> listarSesiones() {
        return sesionCajaRepository.findAll();
    }

    @Transactional
    public SesionCaja abrirCaja(AperturaCajaDTO dto) {
        Caja caja = cajaRepository.findById(dto.getIdCaja())
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));

        // Verificar si ya existe una sesión abierta para esta caja
        sesionCajaRepository.findByCajaIdCajaAndEstado(dto.getIdCaja(), "ABIERTA")
                .ifPresent(s -> {
                    throw new RuntimeException("La caja ya se encuentra ABIERTA");
                });

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar estado de la caja
        caja.setEstado("ABIERTA");
        cajaRepository.save(caja);

        // Crear la nueva sesión
        SesionCaja sesion = new SesionCaja();
        sesion.setCaja(caja);
        sesion.setUsuario(usuario);
        sesion.setMontoInicial(dto.getMontoInicial());
        sesion.setMontoEfectivo(BigDecimal.ZERO);
        sesion.setMontoYape(BigDecimal.ZERO);
        sesion.setFechaApertura(LocalDateTime.now());
        sesion.setEstado("ABIERTA");

        return sesionCajaRepository.save(sesion);
    }

    @Transactional
    public SesionCaja cerrarCaja(CierreCajaDTO dto) {
        SesionCaja sesion = sesionCajaRepository.findById(dto.getIdSesion())
                .orElseThrow(() -> new RuntimeException("Sesión de caja no encontrada"));

        if ("CERRADA".equals(sesion.getEstado())) {
            throw new RuntimeException("Esta sesión de caja ya fue cerrada previamente");
        }

        // Marcar la caja asociada como CERRADA
        Caja caja = sesion.getCaja();
        caja.setEstado("CERRADA");
        cajaRepository.save(caja);

        // Registrar datos de cierre
        sesion.setMontoFinal(dto.getMontoFinal());
        sesion.setFechaCierre(LocalDateTime.now());
        sesion.setEstado("CERRADA");

        return sesionCajaRepository.save(sesion);
    }
}