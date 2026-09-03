package com.fl.dashboard.resources;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

// Proxies the OAuth2 password/refresh_token grants so the client secret never has to
// live in the frontend bundle. The SPA calls these instead of /oauth2/token directly;
// only this server-side call carries the Basic auth header, built from the same
// security.client-id/security.client-secret already used by AuthorizationServerConfig.
@RestController
@RequestMapping("/auth")
public class AuthProxyResource {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${security.client-id}")
    private String clientId;

    @Value("${security.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> body) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("username", body.get("email"));
        form.add("password", body.get("password"));
        return exchangeToken(form);
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@RequestBody Map<String, String> body) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", body.get("refresh_token"));
        return exchangeToken(form);
    }

    private ResponseEntity<String> exchangeToken(MultiValueMap<String, String> form) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String credentials = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());
        headers.set(HttpHeaders.AUTHORIZATION, "Basic " + credentials);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "http://localhost:" + serverPort + "/oauth2/token", request, String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException ex) {
            // Pass the authorization server's error body straight through (error,
            // error_description) so the frontend's existing error handling keeps working
            // unchanged - it already reads error_description off the /oauth2/token response.
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ex.getResponseBodyAsString());
        }
    }
}
