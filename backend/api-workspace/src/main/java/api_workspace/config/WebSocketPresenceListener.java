package api_workspace.config;

import api_workspace.service.WorkspacePresenceService;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import org.springframework.web.socket.messaging.SessionDisconnectEvent;


@Component
public class WebSocketPresenceListener {

    private final WorkspacePresenceService
            workspacePresenceService;


    public WebSocketPresenceListener(
            WorkspacePresenceService workspacePresenceService) {

        this.workspacePresenceService =
                workspacePresenceService;
    }


    @EventListener
    public void handleDisconnect(
            SessionDisconnectEvent event) {

        System.out.println(
                "[WS] Session disconnected: "
                + event.getSessionId()
        );


        workspacePresenceService
                .handleDisconnect(
                        event.getSessionId()
                );
    }
}