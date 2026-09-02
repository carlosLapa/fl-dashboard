package com.fl.dashboard.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("unit")
@DisplayName("TarefaLinkDTO URL validation")
class TarefaLinkDTOTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void acceptsHttpAndHttpsUrls() {
        assertTrue(validator.validate(link("http://example.com/a")).isEmpty());
        assertTrue(validator.validate(link("https://example.com/a")).isEmpty());
    }

    @Test
    void rejectsNonHttpSchemes() {
        // Rendered as a clickable <a href> to other users, so only http(s) is safe.
        assertRejected("javascript:alert(1)");
        assertRejected("data:text/html,<script>alert(1)</script>");
        assertRejected("ftp://example.com/file");
        assertRejected("example.com/no-scheme");
    }

    @Test
    void rejectsBlankUrl() {
        assertFalse(validator.validate(link("")).isEmpty());
    }

    private void assertRejected(String url) {
        Set<ConstraintViolation<TarefaLinkDTO>> violations = validator.validate(link(url));
        assertFalse(violations.isEmpty(), "expected \"" + url + "\" to fail validation");
    }

    private TarefaLinkDTO link(String url) {
        TarefaLinkDTO dto = new TarefaLinkDTO();
        dto.setUrl(url);
        dto.setDescricao("desc");
        return dto;
    }
}
