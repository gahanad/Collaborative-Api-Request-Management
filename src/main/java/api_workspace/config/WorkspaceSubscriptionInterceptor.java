package api_workspace.config;

import api_workspace.entity.User;
import api_workspace.entity.Workspace;
import api_workspace.entity.WorkspaceMember;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.service.WorkspacePresenceService;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Component;


@Component
public class WorkspaceSubscriptionInterceptor
        implements ChannelInterceptor {


    private final WorkspaceRepository workspaceRepository;

    private final WorkspaceMemberRepository
            workspaceMemberRepository;
    private final WorkspacePresenceService
        workspacePresenceService;


    public WorkspaceSubscriptionInterceptor(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            WorkspacePresenceService workspacePresenceService) {

        this.workspaceRepository =
                workspaceRepository;

        this.workspaceMemberRepository =
                workspaceMemberRepository;
        
        this.workspacePresenceService = workspacePresenceService;
    }


    // ==========================================
    // Intercept incoming STOMP messages
    // ==========================================

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);


        // ==========================================
        // Only handle SUBSCRIBE
        // ==========================================

        if (!StompCommand.SUBSCRIBE.equals(
                accessor.getCommand())) {

            return message;
        }


        // ==========================================
        // Get subscription destination
        // ==========================================

        String destination =
                accessor.getDestination();


        if (destination == null) {

            throw new AccessDeniedException(
                    "Subscription destination is missing"
            );
        }


        // ==========================================
        // Only protect workspace topics
        // ==========================================

        String prefix =
                "/topic/workspaces/";


        if (!destination.startsWith(prefix)) {

            return message;
        }


        // ==========================================
        // Extract workspace ID
        // ==========================================

        String workspaceIdString =
                destination.substring(
                        prefix.length()
                );


        // ==========================================
        // Don't allow extra path segments
        //
        // Example:
        //
        // /topic/workspaces/1
        //       ✅
        //
        // /topic/workspaces/1/something
        //       ❌
        // ==========================================

        if (workspaceIdString.isBlank()
                || workspaceIdString.contains("/")) {

            throw new AccessDeniedException(
                    "Invalid workspace subscription"
            );
        }


        Long workspaceId;

        try {

            workspaceId =
                    Long.parseLong(
                            workspaceIdString
                    );

        } catch (NumberFormatException exception) {

            throw new AccessDeniedException(
                    "Invalid workspace ID"
            );
        }


        // ==========================================
        // Workspace ID must be positive
        // ==========================================

        if (workspaceId <= 0) {

            throw new AccessDeniedException(
                    "Invalid workspace ID"
            );
        }


        // ==========================================
        // Get authenticated WebSocket user
        // ==========================================

        Authentication authentication =
                (Authentication)
                        accessor.getUser();


        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                        instanceof User)) {

            throw new AccessDeniedException(
                    "User is not authenticated"
            );
        }


        User currentUser =
                (User)
                        authentication.getPrincipal();


        // ==========================================
        // Check workspace exists
        // ==========================================

        Workspace workspace =
                workspaceRepository
                        .findById(workspaceId)
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Workspace access denied"
                                )
                        );


        // ==========================================
        // Check workspace membership
        // ==========================================

        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                currentUser
                        );


        if (member == null) {

            throw new AccessDeniedException(
                    "You are not a member of this workspace"
            );
        }

        String sessionId = accessor.getSessionId();

        if (sessionId == null) {
        throw new IllegalArgumentException(
                "WebSocket session ID is missing"
        );
        }

        System.out.println(
                "[WS PRESENCE] Registering user="
                + currentUser.getEmail()
                + " | workspace="
                + workspaceId
                + " | session="
                + sessionId
        );

        workspacePresenceService.userJoined(
                sessionId,
                workspaceId,
                currentUser
        );

        // ==========================================
        // Authorized
        // ==========================================

        System.out.println(
                "[WS AUTH] Subscription allowed"
                + " | user="
                + currentUser.getEmail()
                + " | workspace="
                + workspaceId
        );


        return message;
    }
}