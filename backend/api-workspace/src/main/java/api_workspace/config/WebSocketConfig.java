package api_workspace.config;

import org.springframework.context.annotation.Configuration;

import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;

import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {


    private final WebSocketAuthInterceptor
            webSocketAuthInterceptor;

    private final WorkspaceSubscriptionInterceptor
            workspaceSubscriptionInterceptor;


    public WebSocketConfig(
            WebSocketAuthInterceptor webSocketAuthInterceptor,
            WorkspaceSubscriptionInterceptor
                    workspaceSubscriptionInterceptor) {

        this.webSocketAuthInterceptor =
                webSocketAuthInterceptor;

        this.workspaceSubscriptionInterceptor =
                workspaceSubscriptionInterceptor;
    }


    // ==========================================
    // Message Broker
    // ==========================================

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry) {

        registry.enableSimpleBroker(
                "/topic"
        );

        registry.setApplicationDestinationPrefixes(
                "/app"
        );
    }


    // ==========================================
    // WebSocket Endpoint
    // ==========================================

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry) {

        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "*"
                )
                .withSockJS();
    }


    // ==========================================
    // Incoming STOMP messages
    // ==========================================

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration) {

        registration.interceptors(
                webSocketAuthInterceptor,
                workspaceSubscriptionInterceptor
        );
    }
}