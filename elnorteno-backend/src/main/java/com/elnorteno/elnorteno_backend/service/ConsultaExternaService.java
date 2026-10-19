package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.entity.Cliente;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ConsultaExternaService {

    @Value("${decolecta.api.key}")
    private String apiKey;

    @Value("${decolecta.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Caché en memoria (24 horas)
    private static class CacheEntry {
        final Cliente cliente;
        final LocalDateTime expira;
        CacheEntry(Cliente cliente, LocalDateTime expira) {
            this.cliente = cliente;
            this.expira = expira;
        }
    }
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final int HORAS_CACHE = 24;

    private Cliente getDeCache(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) return null;
        if (LocalDateTime.now().isAfter(entry.expira)) {
            cache.remove(key);
            return null;
        }
        log.info("📦 Cliente obtenido de caché: {}", key);
        return entry.cliente;
    }

    private void guardarEnCache(String key, Cliente cliente) {
        if (cliente != null) {
            cache.put(key, new CacheEntry(cliente, LocalDateTime.now().plusHours(HORAS_CACHE)));
            log.info("💾 Cliente guardado en caché: {}", key);
        }
    }

    // ============================================
    // CONSULTAR DNI
    // ============================================
    public Cliente consultarDNI(String numero) {
        if (numero == null || numero.length() != 8) {
            log.warn("⚠️ DNI inválido: {}", numero);
            return null;
        }

        // LOGS DE VERIFICACIÓN
        log.info("🔧 API URL: {}", apiUrl);
        log.info("🔧 API Key: {}", (apiKey != null && !apiKey.isEmpty()) ? "CARGADA" : "❌ NULL");

        if (apiUrl == null || apiUrl.isEmpty()) {
            log.error("❌ decolecta.api.url NO se cargó. Revisa application.properties");
            return null;
        }

        String cacheKey = "DNI_" + numero;
        Cliente cacheado = getDeCache(cacheKey);
        if (cacheado != null) return cacheado;

        String url = apiUrl + "/reniec/dni?numero=" + numero;
        log.info("📡 Consultando: {}", url);

        try {
            Map<String, Object> data = hacerConsulta(url);

            if (data == null || !data.containsKey("first_name")) {
                log.warn("❌ DNI {} no encontrado en RENIEC", numero);
                return null;
            }

            Cliente cliente = new Cliente();
            cliente.setNumeroDocumento(numero);
            cliente.setTipoDocumento("DNI");

            String nombres = (String) data.getOrDefault("first_name", "");
            String apellidoPaterno = (String) data.getOrDefault("first_last_name", "");
            String apellidoMaterno = (String) data.getOrDefault("second_last_name", "");
            cliente.setNombreRazonSocial((nombres + " " + apellidoPaterno + " " + apellidoMaterno).trim());
            cliente.setDireccion((String) data.getOrDefault("address", null));

            log.info("✅ DNI {} encontrado: {}", numero, cliente.getNombreRazonSocial());
            guardarEnCache(cacheKey, cliente);
            return cliente;

        } catch (Exception e) {
            log.error("❌ Error al consultar DNI {}: {}", numero, e.getMessage());
            return null;
        }
    }

    // ============================================
    // CONSULTAR RUC
    // ============================================
    public Cliente consultarRUC(String numero) {
        if (numero == null || numero.length() != 11) {
            log.warn("⚠️ RUC inválido: {}", numero);
            return null;
        }

        if (apiUrl == null || apiUrl.isEmpty()) {
            log.error("❌ decolecta.api.url NO se cargó");
            return null;
        }

        String cacheKey = "RUC_" + numero;
        Cliente cacheado = getDeCache(cacheKey);
        if (cacheado != null) return cacheado;

        String url = apiUrl + "/sunat/ruc?numero=" + numero;

        try {
            Map<String, Object> data = hacerConsulta(url);

            if (data == null || !data.containsKey("razon_social")) {
                log.warn("❌ RUC {} no encontrado en SUNAT", numero);
                return null;
            }

            Cliente cliente = new Cliente();
            cliente.setNumeroDocumento(numero);
            cliente.setTipoDocumento("RUC");
            cliente.setNombreRazonSocial((String) data.get("razon_social"));
            cliente.setDireccion((String) data.getOrDefault("direccion", null));

            log.info("✅ RUC {} encontrado: {}", numero, cliente.getNombreRazonSocial());
            guardarEnCache(cacheKey, cliente);
            return cliente;

        } catch (Exception e) {
            log.error("❌ Error al consultar RUC {}: {}", numero, e.getMessage());
            return null;
        }
    }

    private Map<String, Object> hacerConsulta(String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error en consulta externa: {}", e.getMessage());
            return null;
        }
    }

    public void limpiarCache() {
        cache.clear();
    }

    public int tamanioCache() {
        return cache.size();
    }
}