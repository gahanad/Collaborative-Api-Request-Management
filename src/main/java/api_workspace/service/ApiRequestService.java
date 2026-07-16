package api_workspace.service;

import api_workspace.dto.request.ApiCreateRequest;
import api_workspace.dto.request.ApiRequestSummaryResponse;
import api_workspace.dto.user.UserSummary;
import api_workspace.dto.collection.CollectionSummaryResponse;
import api_workspace.dto.workspace.WorkspaceSummary;
import api_workspace.entity.ApiRequest;
import api_workspace.entity.Collection;
import api_workspace.entity.User;
import api_workspace.entity.Workspace;
import api_workspace.entity.WorkspaceMember;
import api_workspace.enums.WorkspaceRole;
import api_workspace.repository.ApiRequestRepository;
import api_workspace.repository.CollectionRepository;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.repository.WorkspaceRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;



@Service
public class ApiRequestService {
    private final ApiRequestRepository apiRequestRepository;
    private final CollectionRepository collectionRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;

    public ApiRequestService(ApiRequestRepository apiRequestRepository, CollectionRepository collectionRepository, WorkspaceMemberRepository workspaceMemberRepository, WorkspaceRepository workspaceRepository) {
        this.apiRequestRepository = apiRequestRepository;
        this.collectionRepository = collectionRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceRepository = workspaceRepository;
    }

    private ApiRequestSummaryResponse convertToDTO(ApiRequest apiRequest) {

        ApiRequestSummaryResponse response = new ApiRequestSummaryResponse();

        // ApiRequest fields
        response.setId(apiRequest.getId());
        response.setName(apiRequest.getName());
        response.setDescription(apiRequest.getDescription());
        response.setMethod(apiRequest.getMethod());
        response.setUrl(apiRequest.getUrl());
        response.setBody(apiRequest.getBody());
        response.setCreatedAt(apiRequest.getCreatedAt());
        response.setUpdatedAt(apiRequest.getUpdatedAt());

        // ==========================
        // UserSummary
        // ==========================
        UserSummary userDTO = new UserSummary();

        userDTO.setId(apiRequest.getCreatedBy().getId());
        userDTO.setName(apiRequest.getCreatedBy().getName());
        userDTO.setEmail(apiRequest.getCreatedBy().getEmail());

        response.setCreatedBy(userDTO);

        // ==========================
        // CollectionSummaryResponse
        // ==========================
        CollectionSummaryResponse collectionDTO = new CollectionSummaryResponse();

        collectionDTO.setId(apiRequest.getCollection().getId());
        collectionDTO.setName(apiRequest.getCollection().getName());
        collectionDTO.setDescription(apiRequest.getCollection().getDescription());
        collectionDTO.setCreatedAt(apiRequest.getCollection().getCreatedAt());

        // ==========================
        // WorkspaceSummary
        // ==========================
        WorkspaceSummary workspaceDTO = new WorkspaceSummary();

        workspaceDTO.setId(apiRequest.getCollection().getWorkspace().getId());
        workspaceDTO.setName(apiRequest.getCollection().getWorkspace().getName());
        workspaceDTO.setDescription(apiRequest.getCollection().getWorkspace().getDescription());
        workspaceDTO.setCreatedAt(apiRequest.getCollection().getWorkspace().getCreatedAt());

        collectionDTO.setWorkspace(workspaceDTO);

        // ==========================
        // Collection Creator
        // ==========================
        UserSummary collectionCreator = new UserSummary();

        collectionCreator.setId(apiRequest.getCollection().getCreatedBy().getId());
        collectionCreator.setName(apiRequest.getCollection().getCreatedBy().getName());
        collectionCreator.setEmail(apiRequest.getCollection().getCreatedBy().getEmail());

        collectionDTO.setCreatedBy(collectionCreator);

        response.setCollection(collectionDTO);

        return response;
    }
    public ApiRequestSummaryResponse createRequest(Long workspaceId, Long collectionId, ApiCreateRequest request){
        
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        // To check if workspace is present or not
        Workspace workspace = workspaceRepository.findById(workspaceId)
        .orElseThrow(() ->
                new RuntimeException("Workspace not found"));

        // Check if the collection belongs to the workspace
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Collection does not belong to the specified workspace");
        }

        WorkspaceMember workspaceMember =
                workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);

        if (workspaceMember == null) {
            throw new RuntimeException("User is not a member of the workspace");
        }


        // Check the role 
        if (workspaceMember.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException(
                    "You don't have permission to create requests");
        }
        // Create and save the new API request
        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setName(request.getName());
        apiRequest.setDescription(request.getDescription());
        apiRequest.setMethod(request.getMethod());
        apiRequest.setUrl(request.getUrl());
        apiRequest.setBody(request.getBody());
        apiRequest.setCreatedBy(currentUser);
        apiRequest.setCollection(collection);

        ApiRequest savedApiRequest = apiRequestRepository.save(apiRequest);

        // Convert to DTO and return
        return convertToDTO(savedApiRequest);
    }

    public List<ApiRequestSummaryResponse> getAllRequests(Long workspaceId, Long collectionId){
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser = (User) authentication.getPrincipal();
        // Workspace present or not
        Workspace existsWorkspace = workspaceRepository.findById(workspaceId)
        .orElseThrow(()-> new RuntimeException("Workspace not found"));
        // Collection present or not
        Collection existsCollection = collectionRepository.findById(collectionId)
        .orElseThrow(()-> new RuntimeException("Collection not found"));
        // Collection belongs to workspace or not
        if (!existsCollection.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Collection does not belong to the specified workspace");
        }
        // Check if user belongs to workspace or is he member or not
        WorkspaceMember workspaceMember =
                workspaceMemberRepository.findByWorkspaceAndUser(existsWorkspace, currentUser);

        if (workspaceMember == null) {
            throw new RuntimeException("User is not a member of the workspace");
        }

        List<ApiRequest> apiRequests = apiRequestRepository.findByCollection(existsCollection);
        return apiRequests.stream()
        .map(this::convertToDTO)
        .toList();
    }
}