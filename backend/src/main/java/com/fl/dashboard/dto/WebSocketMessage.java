package com.fl.dashboard.dto;

public class WebSocketMessage {
    private String type;
    private Object content;

    // Default constructor
    public WebSocketMessage() {
    }

    // Constructor with parameters
    public WebSocketMessage(String type, Object content) {
        this.type = type;
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getContent() {
        return content;
    }

    public void setContent(Object content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "WebSocketMessage{" +
                "type='" + type + '\'' +
                ", content=" + content +
                '}';
    }
}

