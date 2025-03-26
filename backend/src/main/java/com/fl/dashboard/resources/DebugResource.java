package com.fl.dashboard.resources;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugResource {

    @Value("${cors.origins}")
    private String corsOrigins;

    @GetMapping("/config")
    public Map<String, Object> getDebugInfo() {
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("corsOrigins", corsOrigins);
        debugInfo.put("serverTime", System.currentTimeMillis());
        return debugInfo;
    }
}