package api_workspace.service;

import api_workspace.entity.Workspace;
import api_workspace.repository.CollectionRepository;
import api_workspace.entity.WorkspaceMember;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.repository.WorkspaceRepository;
// import api_workspace.repository.UserRepository;
import api_workspace.entity.User;
import api_workspace.dto.collaboration.CollaborationEvent;
import api_workspace.dto.collection.*;
import api_workspace.dto.user.UserSummary;
import api_workspace.dto.workspace.WorkspaceSummary;
import api_workspace.entity.Collection;
import api_workspace.service.*;
import api_workspace.enums.*;

// import api_workspace.controller.CollectionController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
// import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CollectionService{
    // private final CollectionController collectionController;
    private final CollectionRepository collectionRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ActivityLogService activityLogService;
    private final WorkspaceEventService workspaceEventService;
    private final CollaborationService collaborationService;
    private CollectionSummaryResponse convertToDTO(Collection collection) {

    // Create the main DTO
        CollectionSummaryResponse collectionDTO = new CollectionSummaryResponse();

        collectionDTO.setId(collection.getId());
        collectionDTO.setName(collection.getName());
        collectionDTO.setDescription(collection.getDescription());
        collectionDTO.setCreatedAt(collection.getCreatedAt());

        // ----------------------------
        // Map User -> UserSummaryDTO
        // ----------------------------
        UserSummary userDTO = new UserSummary();

        userDTO.setId(collection.getCreatedBy().getId());
        userDTO.setName(collection.getCreatedBy().getName());
        userDTO.setEmail(collection.getCreatedBy().getEmail());

        collectionDTO.setCreatedBy(userDTO);

        // ---------------------------------
        // Map Workspace -> WorkspaceSummaryDTO
        // ---------------------------------
        WorkspaceSummary workspaceDTO = new WorkspaceSummary();

        workspaceDTO.setId(collection.getWorkspace().getId());
        workspaceDTO.setName(collection.getWorkspace().getName());
        workspaceDTO.setDescription(collection.getWorkspace().getDescription());
        workspaceDTO.setCreatedAt(collection.getWorkspace().getCreatedAt());

        collectionDTO.setWorkspace(workspaceDTO);

        return collectionDTO;
    }
    public CollectionService(CollectionRepository collectionRepository, 
        WorkspaceEventService workspaceEventService,
        WorkspaceMemberRepository workspaceMemberRepository, WorkspaceRepository workspaceRepository, ActivityLogService activityLogService,
        CollaborationService collaborationService){
        // this.collectionController = collectionController;
        this.collectionRepository = collectionRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.activityLogService = activityLogService;
        this.workspaceEventService = workspaceEventService;
        this.collaborationService = collaborationService;
    }

    // Creating a new collection
    public void createCollection(Long workspaceId, CollectionCreateRequest request) {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser = (User) authentication.getPrincipal();
        Workspace existWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        WorkspaceMember workspaceMember =
                workspaceMemberRepository.findByWorkspaceAndUser(existWorkspace, currentUser);
        if (workspaceMember == null) {
            throw new RuntimeException("User is not a member of the workspace");
        }
        if (workspaceMember.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("User does not have permission to create a collection");
        }
        Collection collection = new Collection();

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());

        collection.setWorkspace(existWorkspace);
        collection.setCreatedBy(currentUser);

        collectionRepository.save(collection);
        collaborationService.publishEvent(
            new CollaborationEvent(
                    CollaborationEventType.COLLECTION_CREATED,
                    existWorkspace.getId(),
                    ResourceType.COLLECTION,
                    collection.getId(),
                    collection.getName(),
                    currentUser.getId(),
                    currentUser.getName(),
                    LocalDateTime.now(),
                    null,
                    null
            )
        );
        activityLogService.logActivity(
                existWorkspace,
                currentUser,
                ActivityAction.CREATED,
                ResourceType.COLLECTION,
                collection.getName()
        );
        workspaceEventService.sendEvent(
                existWorkspace.getId(),
                "COLLECTION_CREATED",
                "COLLECTION",
                collection.getName(),
                currentUser.getName()
        );
    }

    // Retrieving all collections for a specific workspace
    public List<CollectionSummaryResponse> getAllCollection(Long workspaceId){        
        Workspace existWorkspace = workspaceRepository.findById(workspaceId)
        .orElseThrow(() -> new RuntimeException("Workspace not found"));
        
        List<Collection> collections = collectionRepository.findByWorkspace(existWorkspace);

        return collections.stream()
        .map(this::convertToDTO)
        .toList();
    }

    public void deleteCollection(Long collectionId){
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser = (User) authentication.getPrincipal();
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        
        Workspace workspace = collection.getWorkspace();
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);

        String collectionName =
                collection.getName();

        Long workspaceId =
                workspace.getId();
        if(workspaceMember == null)
        {
            throw new RuntimeException("User is not a member of the workspace");
        }
        if(workspaceMember.getRole().equals("VIEWER")){
            throw new RuntimeException("User does not have permission to delete the collection");
        } else {
            collectionRepository.delete(collection);
        }

        collaborationService.publishEvent(
            new CollaborationEvent(
                    CollaborationEventType.COLLECTION_DELETED,
                    workspaceId,
                    ResourceType.COLLECTION,
                    collectionId,
                    collectionName,
                    currentUser.getId(),
                    currentUser.getName(),
                    LocalDateTime.now(),
                    null,
                    null
            )
        );
        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.DELETED,
                ResourceType.COLLECTION,
                collection.getName()
        );

        workspaceEventService.sendEvent(
            workspace.getId(),
            "COLLECTION_CREATED",
            "COLLECTION",
            collection.getName(),
            currentUser.getName()
        );
    }

    public void updateCollection(
        Long collectionId,
        CollectionCreateRequest request
    ) {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() ->
                        new RuntimeException("Collection not found"));
        Workspace workspace = collection.getWorkspace();
        WorkspaceMember workspaceMember =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );
        if (workspaceMember == null) {
            throw new RuntimeException(
                    "User is not a member of the workspace"
            );
        }
        if (workspaceMember.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException(
                    "User does not have permission to update this collection"
            );
        }
        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collectionRepository.save(collection);

        collaborationService.publishEvent(
            new CollaborationEvent(
                    CollaborationEventType.COLLECTION_UPDATED,
                    workspace.getId(),
                    ResourceType.COLLECTION,
                    collection.getId(),
                    collection.getName(),
                    currentUser.getId(),
                    currentUser.getName(),
                    LocalDateTime.now(),
                    null,
                    null
            )
        );
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.UPDATED,
                ResourceType.COLLECTION,
                collection.getName()
        );
        workspaceEventService.sendEvent(
                workspace.getId(),
                "COLLECTION_UPDATED",
                "COLLECTION",
                collection.getName(),
                currentUser.getName()
        );
    }

    
}