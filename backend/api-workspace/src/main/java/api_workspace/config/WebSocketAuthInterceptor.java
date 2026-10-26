package api_workspace.config;

import api_workspace.entity.User;
import api_workspace.repository.UserRepository;
import api_workspace.service.JwtService;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public WebSocketAuthInterceptor(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }


    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );


        // ==========================================
        // CONNECT
        // ==========================================

        if (StompCommand.CONNECT.equals(
                accessor.getCommand())) {



            String authorization =
                    accessor.getFirstNativeHeader(
                            "Authorization"
                    );




            // ==========================================
            // Validate Authorization
            // ==========================================

            if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

                throw new IllegalArgumentException(
                        "Missing WebSocket Authorization token"
                );
            }


            // ==========================================
            // Extract JWT
            // ==========================================

            String token =
                    authorization.substring(7);


            String email =
                    jwtService.extractUserEmail(token);




            if (email == null) {

                throw new IllegalArgumentException(
                        "Invalid WebSocket token"
                );
            }


            // ==========================================
            // Find User
            // ==========================================

            User user =
                    userRepository.findByEmail(email);


            if (user == null) {

                throw new IllegalArgumentException(
                        "User not found"
                );
            }



            // ==========================================
            // Create Authentication
            // ==========================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of()
                    );


            // ==========================================
            // Attach user to STOMP session
            // ==========================================

            accessor.setUser(authentication);




        }


        return message;
    }
}