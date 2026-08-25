package api_workspace.listener;

import api_workspace.service.*;
import api_workspace.dto.websocket.EditingSession;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final SessionRegistryService sessionRegistryService;
    private final OnlineUserService onlineUserService;
    private final WorkspaceEventService workspaceEventService;
    private final EditingSessionService editingSessionService;

    public WebSocketEventListener(

            SessionRegistryService sessionRegistryService,
            OnlineUserService onlineUserService,
            WorkspaceEventService workspaceEventService,
            EditingSessionService editingSessionService){

        this.sessionRegistryService = sessionRegistryService;
        this.onlineUserService = onlineUserService;
        this.workspaceEventService = workspaceEventService;
        this.editingSessionService = editingSessionService;
    }

    @EventListener
    public void handleDisconnect(

            SessionDisconnectEvent event){

        String sessionId = event.getSessionId();

        Long workspaceId =
                sessionRegistryService.getWorkspace(sessionId);

        String username =
                sessionRegistryService.getUsername(sessionId);

        

        if(workspaceId != null && username != null){

            onlineUserService.userDisconnected(
                    workspaceId,
                    username);
            workspaceEventService.broadcastOnlineUsers(
                    workspaceId);

            EditingSession editingSession =
            editingSessionService.removeUserEditing(
                    username
            );
            if(editingSession != null){

                workspaceEventService
                        .broadcastEditingStopped(
                                editingSession
                        );
            }

            sessionRegistryService.removeSession(sessionId);
        }
    }
}