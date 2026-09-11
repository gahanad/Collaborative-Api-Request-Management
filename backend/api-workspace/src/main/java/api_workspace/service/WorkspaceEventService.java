package api_workspace.service;

import api_workspace.dto.websocket.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WorkspaceEventService {

    private final SimpMessagingTemplate messagingTemplate;
    private final OnlineUserService onlineUserService;

    public WorkspaceEventService(SimpMessagingTemplate messagingTemplate, OnlineUserService onlineUserService) {
        this.messagingTemplate = messagingTemplate;
        this.onlineUserService = onlineUserService;
    }

    public void sendEvent(
            Long workspaceId,
            String action,
            String resourceType,
            String resourceName,
            String username) {

        WorkspaceEvent event = new WorkspaceEvent(
                action,
                resourceType,
                resourceName,
                username,
                LocalDateTime.now()
        );

        messagingTemplate.convertAndSend(
                "/topic/workspaces/" + workspaceId,
                event
        );
    }

    public void broadcastOnlineUsers(Long workspaceId){

        OnlineUsersResponse response =
                new OnlineUsersResponse(
                        workspaceId,
                        onlineUserService
                                .getOnlineUsers(workspaceId)
                );
        messagingTemplate.convertAndSend(
                "/topic/workspaces/"
                        + workspaceId
                        + "/online-users",

                response
        );
    }

    public void broadcastEditing(
        EditingRequest request){
        messagingTemplate.convertAndSend(

                "/topic/workspaces/"
                        + request.getWorkspaceId()
                        + "/editing",

                request
        );
    }

    public void broadcastEditingStopped(
        EditingSession session){

        EditingRequest request =
                new EditingRequest(
                        session.getWorkspaceId(),
                        session.getRequestId(),
                        session.getRequestName(),
                        session.getUsername(),
                        false
                );

        messagingTemplate.convertAndSend(
                "/topic/workspaces/"
                        + session.getWorkspaceId()
                        + "/editing",

                request
        );
    }
}