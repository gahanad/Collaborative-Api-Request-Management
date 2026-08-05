package api_workspace.controller;

import api_workspace.dto.websocket.*;
import api_workspace.service.*;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.SendTo;
import java.time.LocalDateTime;

@Controller
public class WorkspaceWebSocketController {

    private final OnlineUserService onlineUserService;
    private final WorkspaceEventService workspaceEventService;
    private final SessionRegistryService sessionRegistryService;
    private final EditingSessionService editingSessionService;

    public WorkspaceWebSocketController(
            OnlineUserService onlineUserService,
            WorkspaceEventService workspaceEventService,
            SessionRegistryService sessionRegistryService,
            EditingSessionService editingSessionService){

        this.onlineUserService = onlineUserService;
        this.workspaceEventService = workspaceEventService;
        this.sessionRegistryService = sessionRegistryService;
        this.editingSessionService = editingSessionService;
    }

    @MessageMapping("/join")
    public void joinWorkspace(

            JoinWorkspaceRequest request,

            SimpMessageHeaderAccessor headerAccessor){

        String sessionId = headerAccessor.getSessionId();

        sessionRegistryService.registerSession(

                sessionId,

                request.getWorkspaceId(),

                request.getUsername());

        onlineUserService.userConnected(

                request.getWorkspaceId(),

                request.getUsername());

        workspaceEventService.broadcastOnlineUsers(

                request.getWorkspaceId());
    }

    @MessageMapping("/editing")
    public void editingRequest(
            EditingRequest request){

        if(request.isEditing()){
            boolean locked =

            editingSessionService.acquireLock(
                    new EditingSession(
                            request.getWorkspaceId(),
                            request.getRequestId(),
                            request.getRequestName(),
                            request.getUsername()
                    )
            );
            if(!locked){
                throw new RuntimeException(
                        "Request is currently locked by "
                        + editingSessionService.getLockOwner(
                                request.getRequestId()
                        )
                );
            }
        }else{
            editingSessionService.releaseLock(
                    request.getRequestId());
        }
        workspaceEventService.broadcastEditing(request);
    }

    
}