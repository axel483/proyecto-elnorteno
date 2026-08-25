package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.dto.DetalleVentaDTO;
import com.elnorteno.elnorteno_backend.dto.VentaDTO;
import com.elnorteno.elnorteno_backend.entity.*;
import com.elnorteno.elnorteno_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Autowired
    private ComprobanteRepository comprobanteRepository;

    @Autowired
    private SesionCajaRepository sesionCajaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PresentacionProductoRepository presentacionRepository;

    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    public List<DetalleVenta> listarDetallesPorVenta(Integer idVenta) {
        return detalleVentaRepository.findByVentaIdVenta(idVenta);
    }

    @Transactional
    public Venta registrarVenta(VentaDTO dto) {
        // 1. Validar Sesión de Caja Abierta
        SesionCaja sesion = sesionCajaRepository.findById(dto.getIdSesion())
                .orElseThrow(() -> new RuntimeException("Sesión de caja no encontrada"));

        if (!"ABIERTA".equals(sesion.getEstado())) {
            throw new RuntimeException("No se pueden registrar ventas en una caja CERRADA");
        }

        // 2. Validar Cliente y Usuario
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Crear y guardar la Venta
        Venta venta = new Venta();
        venta.setSesionCaja(sesion);
        venta.setCliente(cliente);
        venta.setUsuario(usuario);
        venta.setMetodoPago(dto.getMetodoPago());
        venta.setMontoTotal(dto.getMontoTotal());

        Venta ventaGuardada = ventaRepository.save(venta);

        // 4. Guardar Detalles y actualizar Stock
        for (DetalleVentaDTO detDTO : dto.getDetalles()) {
            PresentacionProducto pres = presentacionRepository.findById(detDTO.getIdPresentacion())
                    .orElseThrow(() -> new RuntimeException("Presentación de producto no encontrada"));

            // Validar Stock
            if (pres.getStockFisico() < detDTO.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + pres.getNombrePresentacion());
            }

            // Descontar Stock
            pres.setStockFisico(pres.getStockFisico() - detDTO.getCantidad());
            presentacionRepository.save(pres);

            // Crear Detalle
            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(ventaGuardada);
            detalle.setPresentacion(pres);
            detalle.setCantidad(detDTO.getCantidad());
            detalle.setPrecioAplicado(detDTO.getPrecioAplicado());
            
            BigDecimal subtotal = detDTO.getPrecioAplicado().multiply(new BigDecimal(detDTO.getCantidad()));
            detalle.setSubtotal(subtotal);

            detalleVentaRepository.save(detalle);
        }

        // 5. Actualizar los montos acumulados en la Sesión de Caja
        if ("EFECTIVO".equalsIgnoreCase(dto.getMetodoPago())) {
            sesion.setMontoEfectivo(sesion.getMontoEfectivo().add(dto.getMontoTotal()));
        } else if ("YAPE".equalsIgnoreCase(dto.getMetodoPago())) {
            sesion.setMontoYape(sesion.getMontoYape().add(dto.getMontoTotal()));
        } else {
            // Si es Mixto o similar, se puede manejar dividiendo o sumando según lógica.
            sesion.setMontoEfectivo(sesion.getMontoEfectivo().add(dto.getMontoTotal()));
        }
        sesionCajaRepository.save(sesion);

        // 6. Generar Comprobante
        Comprobante comprobante = new Comprobante();
        comprobante.setVenta(ventaGuardada);
        comprobante.setTipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "NOTA_VENTA");
        comprobante.setSerie(dto.getSerie() != null ? dto.getSerie() : "NV01");
        comprobante.setNumero(dto.getNumero() != null ? dto.getNumero() : String.format("%08d", ventaGuardada.getIdVenta()));
        comprobante.setEstadoSunat("NO_ENVIADO");
        comprobante.setFormatoImpresion(dto.getFormatoImpresion() != null ? dto.getFormatoImpresion() : "TICKET_80MM");

        comprobanteRepository.save(comprobante);

        return ventaGuardada;
    }
}