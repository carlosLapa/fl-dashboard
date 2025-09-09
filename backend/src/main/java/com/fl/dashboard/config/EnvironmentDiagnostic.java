package com.fl.dashboard.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class EnvironmentDiagnostic {

    private static final Logger logger = LoggerFactory.getLogger(EnvironmentDiagnostic.class);

    @Autowired
    private Environment environment;

    @PostConstruct
    public void logEnvironmentVariables() {
        logger.info("Environment Variables Diagnostic:");

        // Slack configuration
        logger.info("SLACK_WEBHOOK: {}", maskIfPresent(environment.getProperty("SLACK_WEBHOOK")));
        logger.info("SLACK_ENABLED: {}", environment.getProperty("SLACK_ENABLED"));
        logger.info("SLACK_DEFAULT_CHANNEL: {}", environment.getProperty("SLACK_DEFAULT_CHANNEL"));
        logger.info("SLACK_NOTIFICATION_TYPES: {}", environment.getProperty("SLACK_NOTIFICATION_TYPES"));

        // Spring mapped properties
        logger.info("slack.webhook-url: {}", maskIfPresent(environment.getProperty("slack.webhook-url")));
        logger.info("slack.enabled: {}", environment.getProperty("slack.enabled"));
        logger.info("slack.default-channel: {}", environment.getProperty("slack.default-channel"));
        logger.info("slack.notification-types: {}", environment.getProperty("slack.notification-types"));
    }

    private String maskIfPresent(String value) {
        if (value == null) return "null";
        if (value.isEmpty()) return "empty";
        if (value.startsWith("https://hooks.slack.com/")) {
            return "configured (valid format)";
        }
        return "configured (invalid format)";
    }
}