package com.fl.dashboard.customgrant;

import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationGrantAuthenticationToken;

import java.io.Serial;
import java.util.*;

public class CustomPasswordAuthenticationToken extends OAuth2AuthorizationGrantAuthenticationToken {

    @Serial
    private static final long serialVersionUID = 1L;
    private final String username;
    private final String password;
    private final Set<String> scopes;

    public CustomPasswordAuthenticationToken(Authentication clientPrincipal,
                                             @Nullable Set<String> scopes,
                                             @Nullable Map<String, Object> additionalParameters) {
        super(new AuthorizationGrantType("password"), clientPrincipal, additionalParameters);

        // Safely handle null additionalParameters
        Map<String, Object> parameters = additionalParameters != null ? additionalParameters : Collections.emptyMap();

        this.username = (String) parameters.getOrDefault("username", "");
        this.password = (String) parameters.getOrDefault("password", "");
        this.scopes = Collections.unmodifiableSet(
                scopes != null ? new HashSet<>(scopes) : Collections.emptySet());
    }

    public String getUsername() {
        return this.username;
    }

    public String getPassword() {
        return this.password;
    }

    public Set<String> getScopes() {
        return this.scopes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CustomPasswordAuthenticationToken that)) return false;
        if (!super.equals(o)) return false;

        return Objects.equals(username, that.username) &&
                // Note: We intentionally exclude password from equals for security reasons
                Objects.equals(scopes, that.scopes);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), username, scopes);
        // Note: We intentionally exclude password from hashCode for security reasons
    }
}
