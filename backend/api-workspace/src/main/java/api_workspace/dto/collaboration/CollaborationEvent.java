package api_workspace.dto.collaboration;

import api_workspace.enums.CollaborationEventType;
import api_workspace.enums.ResourceType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollaborationEvent {

    // ==========================================
    // Event Type
    // ==========================================

    private CollaborationEventType type;


    // ==========================================
    // Workspace
    // ==========================================

    private Long workspaceId;


    // ==========================================
    // Resource
    // ==========================================

    private ResourceType resourceType;

    private Long resourceId;

    private String resourceName;


    // ==========================================
    // User who performed the action
    // ==========================================

    private Long userId;

    private String userName;


    // ==========================================
    // Time
    // ==========================================

    private LocalDateTime timestamp;


    // ==========================================
    // Request Move
    // ==========================================

    private Long sourceCollectionId;

    private Long targetCollectionId;
}