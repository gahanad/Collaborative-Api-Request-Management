package api_workspace.service;

import api_workspace.entity.Workspace;
import api_workspace.repository.CollectionRepository;
import api_workspace.entity.WorkspaceMember;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.repository.UserRepository;
import api_workspace.entity.User;
import api_workspace.dto.collection.CollectionSummaryResponse;
import api_workspace.dto.user.UserSummary;
import api_workspace.dto.workspace.WorkspaceSummary;
import api_workspace.entity.Collection;
// import api_workspace.controller.CollectionController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Service
public class CollectionService{
    // private final CollectionController collectionController;
    private final CollectionRepository collectionRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
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
    public CollectionService(CollectionRepository collectionRepository, WorkspaceMemberRepository workspaceMemberRepository, WorkspaceRepository workspaceRepository){
        // this.collectionController = collectionController;
        this.collectionRepository = collectionRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceRepository = workspaceRepository;
    }

    // Creating a new collection
    public void createCollection(Long workspaceId, Collection collection){
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Object principal = authentication.getPrincipal();
        User currentUser = (User) authentication.getPrincipal();
        Workspace existWorkspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new RuntimeException("Workspace not found"));

        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceAndUser(existWorkspace, currentUser);
        if(workspaceMember == null) {
                throw new RuntimeException("User is not a member of the workspace");
        }
        if(workspaceMember.getRole().equals("VIEWER")){
            throw new RuntimeException("User does not have permission to create a collection");
        } else {
            collection.setWorkspace(existWorkspace);
            collection.setCreatedBy(currentUser);
            collectionRepository.save(collection);
        }
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
        if(workspaceMember == null)
        {
            throw new RuntimeException("User is not a member of the workspace");
        }
        if(workspaceMember.getRole().equals("VIEWER")){
            throw new RuntimeException("User does not have permission to delete the collection");
        } else {
            collectionRepository.delete(collection);
        }
    }
}