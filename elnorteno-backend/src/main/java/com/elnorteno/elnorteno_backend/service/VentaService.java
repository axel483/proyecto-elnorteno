package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.dto.DetalleVentaDTO;
import com.elnorteno.elnorteno_backend.dto.VentaDTO;
import com.elnorteno.elnorteno_backend.entity.*;
import com.elnorteno.elnorteno_backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
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

    @Autowired
    private NotificacionService notificacionService;

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

        // 2. Obtener Cliente (fallback a ID 1)
        Cliente cliente;
        if (dto.getIdCliente() != null && dto.getIdCliente() > 0) {
            cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        } else {
            cliente = clienteRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Cliente por defecto (ID 1) no encontrado."));
        }

        // 3. Obtener Usuario (fallback a ID 1)
        Usuario usuario;
        if (dto.getIdUsuario() != null && dto.getIdUsuario() > 0) {
            usuario = usuarioRepository.findById(dto.getIdUsuario())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        } else {
            usuario = usuarioRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Usuario por defecto (ID 1) no encontrado."));
        }

        // 4. Crear y guardar la Venta
        Venta venta = new Venta();
        venta.setSesionCaja(sesion);
        venta.setCliente(cliente);
        venta.setUsuario(usuario);
        venta.setMetodoPago(dto.getMetodoPago());
        venta.setTipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "BOLETA");
        venta.setMontoTotal(dto.getMontoTotal() != null ? dto.getMontoTotal() : BigDecimal.ZERO);
        venta.setTotal(dto.getMontoTotal() != null ? dto.getMontoTotal() : BigDecimal.ZERO);
        venta.setNumComprobante(null);
        venta.setFechaHora(LocalDateTime.now());
        
        // 👇 GUARDAR EL ID DE LA EMPRESA
        venta.setIdEmpresa(dto.getIdEmpresa() != null ? dto.getIdEmpresa() : 1);

        Venta ventaGuardada = ventaRepository.save(venta);

        // 👇 Set para evitar notificar el mismo producto múltiples veces en una venta
        Set<Integer> productosNotificados = new HashSet<>();

        // 5. Guardar Detalles y actualizar Stock
        for (DetalleVentaDTO detDTO : dto.getDetalles()) {
            PresentacionProducto pres = presentacionRepository.findById(detDTO.getIdPresentacion())
                    .orElseThrow(() -> new RuntimeException("Presentación de producto no encontrada"));

            Producto producto = pres.getProducto();

            int unidadesADescontar = detDTO.getCantidad() * pres.getFactorConversion();

            if (producto.getStock() < unidadesADescontar) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre() +
                        " (Stock disponible: " + producto.getStock() +
                        ", Necesario: " + unidadesADescontar + ")");
            }

            // Descontar del stock
            producto.setStock(producto.getStock() - unidadesADescontar);

            // 👇 ALERTA DE STOCK BAJO
            int stockMinimo = producto.getStockMinimo() != null ? producto.getStockMinimo() : 5;
            if (producto.getStock() <= stockMinimo && !productosNotificados.contains(producto.getIdProducto())) {
                log.warn("⚠️ Stock bajo en {}: {} unidades (mínimo: {})",
                        producto.getNombre(), producto.getStock(), stockMinimo);
                notificacionService.enviarAlertaStockBajo(producto);
                productosNotificados.add(producto.getIdProducto());
            }

            // Crear Detalle
            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(ventaGuardada);
            detalle.setPresentacion(pres);
            detalle.setProducto(producto);
            detalle.setCantidad(detDTO.getCantidad());
            detalle.setPrecioAplicado(detDTO.getPrecioAplicado());
            detalle.setPrecioUnitario(detDTO.getPrecioAplicado());

            BigDecimal subtotal = detDTO.getPrecioAplicado().multiply(new BigDecimal(detDTO.getCantidad()));
            detalle.setSubtotal(subtotal);

            detalleVentaRepository.save(detalle);
        }

        // 6. Actualizar montos en Sesión de Caja
        if ("EFECTIVO".equalsIgnoreCase(dto.getMetodoPago())) {
            sesion.setMontoEfectivo(sesion.getMontoEfectivo().add(dto.getMontoTotal()));
        } else if ("YAPE".equalsIgnoreCase(dto.getMetodoPago())) {
            sesion.setMontoYape(sesion.getMontoYape().add(dto.getMontoTotal()));
        } else {
            sesion.setMontoEfectivo(sesion.getMontoEfectivo().add(dto.getMontoTotal()));
        }
        sesionCajaRepository.save(sesion);

        // 7. Generar Comprobante
        Comprobante comprobante = new Comprobante();
        comprobante.setVenta(ventaGuardada);
        comprobante.setTipoComprobante(venta.getTipoComprobante());
        comprobante.setSerie("NV01");
        comprobante.setNumero(String.format("%08d", ventaGuardada.getIdVenta()));
        comprobante.setEstadoSunat("NO_ENVIADO");
        comprobante.setFormatoImpresion("TICKET_80MM");
        comprobanteRepository.save(comprobante);

        return ventaGuardada;
    }
}