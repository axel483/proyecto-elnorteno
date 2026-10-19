package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.Producto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;  // 👈 NUEVO
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {

    private final JavaMailSender mailSender;

    @Value("${alertas.stock.email.destino}")
    private String emailsDestino;

    @Value("${spring.mail.username}")
    private String emailOrigen;

    @Value("${alertas.stock.habilitado:true}")
    private boolean alertasHabilitadas;

    /**
     * Envía una alerta cuando el stock está por agotarse.
     * @Async hace que se ejecute en un hilo separado, sin bloquear la venta.
     */
    @Async  // 👈 CLAVE: el correo se envía en segundo plano
    public void enviarAlertaStockBajo(Producto producto) {
        if (!alertasHabilitadas) {
            log.info("⚠️ Alertas deshabilitadas. No se envía correo.");
            return;
        }

        try {
            // Parsear los correos
            String[] destinatarios = emailsDestino.split(",");
            for (int i = 0; i < destinatarios.length; i++) {
                destinatarios[i] = destinatarios[i].trim();
            }

            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(emailOrigen);
            mensaje.setTo(destinatarios);
            mensaje.setSubject("⚠️ ALERTA: Stock bajo en " + producto.getNombre());

            String cuerpo = "🔔 SISTEMA DE GESTIÓN EL NORTEÑO\n" +
                    "=====================================\n\n" +
                    "⚠️ ALERTA DE STOCK BAJO\n\n" +
                    "Producto: " + producto.getNombre() + "\n" +
                    "Stock actual: " + producto.getStock() + " unidades\n" +
                    "Stock mínimo: " + producto.getStockMinimo() + " unidades\n\n" +
                    "📦 ACCIÓN REQUERIDA:\n" +
                    "Es momento de reabastecer este producto.\n\n" +
                    "=====================================\n" +
                    "Sistema de Gestión - Comercial El Norteño\n" +
                    "Huamanga - Ayacucho\n" +
                    "Fecha: " + java.time.LocalDateTime.now().format(
                        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

            mensaje.setText(cuerpo);
            mailSender.send(mensaje);

            log.info("📧 Alerta enviada a {} correo(s) para producto: {} (stock: {})",
                    destinatarios.length, producto.getNombre(), producto.getStock());
        } catch (Exception e) {
            log.error("❌ Error al enviar alerta de correo: {}", e.getMessage());
        }
    }
}