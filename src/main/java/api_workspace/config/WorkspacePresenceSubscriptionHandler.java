package api_workspace.config;

import api_workspace.service.WorkspacePresenceService;

import org.springframework.stereotype.Component;

import org.springframework.context.event.EventListener;

import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

@Component
public class WorkspacePresenceSubscriptionHandler {

    private final WorkspacePresenceService
            workspacePresenceService;

    public WorkspacePresenceSubscriptionHandler(
            WorkspacePresenceService workspacePresenceService) {

        this.workspacePresenceService =
                workspacePresenceService;
    }


    @EventListener
    public void handleSubscription(
            SessionSubscribeEvent event) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(
                        event.getMessage()
                );


        String destination =
                accessor.getDestination();


        if (destination == null) {
            return;
        }


        String prefix =
                "/topic/workspaces/";


        if (!destination.startsWith(prefix)) {
            return;
        }


        String workspaceIdString =
                destination.substring(
                        prefix.length()
                );


        Long workspaceId;

        try {

            workspaceId =
                    Long.parseLong(
                            workspaceIdString
                    );

        } catch (NumberFormatException e) {

            return;
        }


        System.out.println(
                "📡 Workspace subscription detected for workspace: "
                        + workspaceId
        );


        workspacePresenceService
                .publishCollaboratorSnapshot(
                        workspaceId
                );
    }
}