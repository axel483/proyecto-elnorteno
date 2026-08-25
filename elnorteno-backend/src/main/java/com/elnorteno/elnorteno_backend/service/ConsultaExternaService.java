package com.elnorteno.elnorteno_backend.service;

import com.elnorteno.elnorteno_backend.dto.ApiResponse;
import com.elnorteno.elnorteno_backend.entity.Cliente;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ConsultaExternaService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_KEY = "d2f920e9cda5e3c3c7b0875f00efcf59";

    public Cliente consultarDNI(String numero) {
        String url = "https://peruapi.com/api/dni/" + numero + "?api_token=" + API_KEY;
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-KEY", API_KEY);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<ApiResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, ApiResponse.class);

            // === LOGS PARA DEPURACIÓN ===
            System.out.println("\n========== RESPUESTA DE PERUAPI (DNI) ==========");
            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Headers: " + response.getHeaders());
            System.out.println("Body (raw): " + response.getBody());
            System.out.println("=================================================\n");

            ApiResponse data = response.getBody();
            if (data == null) {
                System.out.println("La respuesta está vacía.");
                return null;
            }

            // Verificar si al menos tiene nombres
            if (data.getNombres() == null && data.getApellidoPaterno() == null) {
                System.out.println("No se encontraron datos de nombre para este DNI.");
                return null;
            }

            Cliente cliente = new Cliente();
            cliente.setNumeroDocumento(numero);
            cliente.setTipoDocumento("DNI");

            // Construir nombre completo con los campos que vengan
            String nombres = data.getNombres() != null ? data.getNombres() : "";
            String apellidoPaterno = data.getApellidoPaterno() != null ? data.getApellidoPaterno() : "";
            String apellidoMaterno = data.getApellidoMaterno() != null ? data.getApellidoMaterno() : "";

            String nombreCompleto;
            if (!apellidoPaterno.isEmpty() || !apellidoMaterno.isEmpty()) {
                nombreCompleto = (nombres + " " + apellidoPaterno + " " + apellidoMaterno).trim();
            } else {
                // Si no hay apellidos separados, usar solo el campo nombres
                nombreCompleto = nombres;
            }

            cliente.setNombreRazonSocial(nombreCompleto);
            cliente.setDireccion(data.getDireccion());

            System.out.println("Cliente mapeado: " + cliente);
            return cliente;

        } catch (Exception e) {
            System.err.println("Error al consultar DNI en PeruAPI: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public Cliente consultarRUC(String numero) {
        String url = "https://peruapi.com/api/ruc/" + numero + "?api_token=" + API_KEY;
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-KEY", API_KEY);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<ApiResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, ApiResponse.class);

            // === LOGS PARA DEPURACIÓN ===
            System.out.println("\n========== RESPUESTA DE PERUAPI (RUC) ==========");
            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Body (raw): " + response.getBody());
            System.out.println("=================================================\n");

            ApiResponse data = response.getBody();
            if (data == null || data.getRazonSocial() == null) {
                System.out.println("No se encontró RUC o razón social.");
                return null;
            }

            Cliente cliente = new Cliente();
            cliente.setNumeroDocumento(numero);
            cliente.setTipoDocumento("RUC");
            cliente.setNombreRazonSocial(data.getRazonSocial());
            cliente.setDireccion(data.getDireccion());

            System.out.println("Cliente mapeado: " + cliente);
            return cliente;

        } catch (Exception e) {
            System.err.println("Error al consultar RUC en PeruAPI: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}