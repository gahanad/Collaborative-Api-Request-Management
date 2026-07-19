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

    public ApiRequestSummaryResponse getRequest(Long workspaceId, Long collectionId, Long requestId){
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

        // Request present or not
        ApiRequest existsRequest = apiRequestRepository.findById(requestId)
        .orElseThrow(()-> new RuntimeException("Request not found"));

        if(!existsRequest.getCollection().getId().equals(collectionId)){
            throw new RuntimeException("Request does not belong to the specified collection");
        }
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

        return convertToDTO(existsRequest);
    }

    public ApiRequestSummaryResponse updateRequest(Long workspaceId, Long collectionId, Long requestId, ApiCreateRequest request){
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

        // Request present or not
        ApiRequest existsRequest = apiRequestRepository.findById(requestId)
        .orElseThrow(()-> new RuntimeException("Request not found"));

        if(!existsRequest.getCollection().getId().equals(collectionId)){
            throw new RuntimeException("Request does not belong to the specified collection");
        }
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

        // VIEWER cannot update
        if (workspaceMember.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("You do not have permission to update this request");
        }

        // Update fields
        existsRequest.setName(request.getName());
        existsRequest.setDescription(request.getDescription());
        existsRequest.setMethod(request.getMethod());
        existsRequest.setUrl(request.getUrl());
        existsRequest.setBody(request.getBody());

        ApiRequest updatedRequest = apiRequestRepository.save(existsRequest);

        return convertToDTO(updatedRequest);
    }

    public String deleteRequest(Long workspaceId, Long collectionId, Long requestId) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        // Workspace exists
        Workspace existsWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Collection exists
        Collection existsCollection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        // Collection belongs to workspace
        if (!existsCollection.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Collection does not belong to the specified workspace");
        }

        // Request exists
        ApiRequest existsRequest = apiRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Request belongs to collection
        if (!existsRequest.getCollection().getId().equals(collectionId)) {
            throw new RuntimeException("Request does not belong to the specified collection");
        }

        // User is a workspace member
        WorkspaceMember workspaceMember =
                workspaceMemberRepository.findByWorkspaceAndUser(existsWorkspace, currentUser);

        if (workspaceMember == null) {
            throw new RuntimeException("User is not a member of the workspace");
        }

        // Only ADMIN and EDITOR can delete
        if (workspaceMember.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("You do not have permission to delete this request");
        }

        apiRequestRepository.delete(existsRequest);

        return "Request deleted successfully";
    }

    public ApiRequestSummaryResponse duplicateRequest(
        Long workspaceId,
        Long collectionId,
        Long requestId) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        // Workspace exists
        Workspace existsWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Collection exists
        Collection existsCollection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        // Collection belongs to workspace
        if (!existsCollection.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Collection does not belong to the specified workspace");
        }

        // Request exists
        ApiRequest existsRequest = apiRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Request belongs to collection
        if (!existsRequest.getCollection().getId().equals(collectionId)) {
            throw new RuntimeException("Request does not belong to the specified collection");
        }

        // User is workspace member
        WorkspaceMember workspaceMember =
                workspaceMemberRepository.findByWorkspaceAndUser(existsWorkspace, currentUser);

        if (workspaceMember == null) {
            throw new RuntimeException("User is not a member of the workspace");
        }

        // VIEWER cannot duplicate
        if (workspaceMember.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("You do not have permission to duplicate this request");
        }

        // Create duplicate
        ApiRequest duplicateRequest = new ApiRequest();

        duplicateRequest.setName(existsRequest.getName() + " Copy");
        duplicateRequest.setDescription(existsRequest.getDescription());
        duplicateRequest.setMethod(existsRequest.getMethod());
        duplicateRequest.setUrl(existsRequest.getUrl());
        duplicateRequest.setBody(existsRequest.getBody());

        duplicateRequest.setCollection(existsCollection);
        duplicateRequest.setCreatedBy(currentUser);

        ApiRequest savedRequest = apiRequestRepository.save(duplicateRequest);

        return convertToDTO(savedRequest);
    }
}