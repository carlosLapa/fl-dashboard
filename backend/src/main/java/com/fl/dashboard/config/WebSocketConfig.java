package com.fl.dashboard.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.SubscribableChannel;
import org.springframework.messaging.converter.DefaultContentTypeResolver;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.ExecutorSubscribableChannel;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.util.MimeType;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.messaging.StompSubProtocolHandler;
import org.springframework.web.socket.messaging.SubProtocolWebSocketHandler;

import java.util.List;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);
    private final JwtDecoder jwtDecoder;

    @Value("${cors.origins}")
    private String corsOrigins;

    public WebSocketConfig(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000", "https://ferreiralapa-dashboard.pt")
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
    }

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeType.valueOf("application/json"));
        converter.setContentTypeResolver(resolver);
        messageConverters.add(converter);
        return false;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                assert accessor != null;
                logger.info("Received WebSocket message: {}", message);
                logger.info("StompCommand: {}", accessor.getCommand());

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    return handleConnectCommand(message, accessor);
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    logger.info("STOMP Subscribe received: {}", accessor);
                } else if (StompCommand.SEND.equals(accessor.getCommand())) {
                    logger.info("STOMP Send received: {}", accessor);
                }

                return message;
            }

            private Message<?> handleConnectCommand(Message<?> message, StompHeaderAccessor accessor) {
                String authToken = accessor.getFirstNativeHeader("Authorization");
                if (authToken != null && authToken.startsWith("Bearer ")) {
                    String token = authToken.substring(7); // Remove "Bearer " prefix
                    logger.info("Token extracted from headers: {}", token);
                    try {
                        jwtDecoder.decode(token);
                        logger.info("JWT token successfully decoded");
                    } catch (Exception e) {
                        logger.error("Failed to decode JWT token", e);
                        return null; // Block the message if token is invalid
                    }
                } else {
                    logger.error("Authorization header missing or malformed");
                    return null; // Block the message if token is missing or malformed
                }
                return message; // Return the original message if authentication is successful
            }
        });
    }

    @Bean(name = "customSubProtocolWebSocketHandler")
    public WebSocketHandler subProtocolWebSocketHandler() {
        SubscribableChannel inboundChannel = new ExecutorSubscribableChannel();
        SubscribableChannel outboundChannel = new ExecutorSubscribableChannel();

        SubProtocolWebSocketHandler handler = new SubProtocolWebSocketHandler(inboundChannel, outboundChannel);
        handler.setDefaultProtocolHandler(new StompSubProtocolHandler());
        return handler;
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(8192)
                .setSendBufferSizeLimit(8192)
                .setSendTimeLimit(10000);
        registration.addDecoratorFactory(handler -> new WebSocketHandlerDecorator(handler) {
            @Override
            public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
                logger.info("WebSocket Message Received: {}", message.getPayload());
                try {
                    super.handleMessage(session, message);
                } catch (Exception e) {
                    logger.error("Error handling WebSocket message", e);
                    throw e;
                }
            }

            @Override
            public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                logger.info("WebSocket connection established: {}", session.getId());
                super.afterConnectionEstablished(session);
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                logger.info("WebSocket connection closed: {}, status: {}", session.getId(), closeStatus);
                super.afterConnectionClosed(session, closeStatus);
            }
        });
    }
}
