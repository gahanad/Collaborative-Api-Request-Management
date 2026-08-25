package api_workspace.service;

import api_workspace.dto.collaboration.CollaborationEvent;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;


@Service
public class CollaborationService {


    private final SimpMessagingTemplate messagingTemplate;


    public CollaborationService(
            SimpMessagingTemplate messagingTemplate) {

        this.messagingTemplate = messagingTemplate;
    }


    // ==========================================
    // Publish Collaboration Event
    // ==========================================

    public void publishEvent(
            CollaborationEvent event) {

        String destination =
                "/topic/workspaces/"
                + event.getWorkspaceId();


        messagingTemplate.convertAndSend(
                destination,
                event
        );
    }
}