package api_workspace.service;

import api_workspace.dto.request.ApiCreateRequest;
import api_workspace.dto.authorization.*;
import api_workspace.dto.request.ApiRequestSummaryResponse;
import api_workspace.dto.user.UserSummary;
import api_workspace.dto.collection.CollectionSummaryResponse;
import api_workspace.dto.workspace.WorkspaceSummary;
import api_workspace.entity.*;
import api_workspace.repository.*;
import api_workspace.service.*;
import api_workspace.enums.*;
import api_workspace.dto.collaboration.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
// import java.util.Collection;
import java.util.List;



@Service
public class ApiRequestService {
    private final ApiRequestRepository apiRequestRepository;
    private final CollectionRepository collectionRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ActivityLogService activityLogService;
    private final AuthorizationRepository authorizationRepository;
    private final WorkspaceEventService workspaceEventService;
    private final CollaborationService collaborationService;



    public ApiRequestService(ApiRequestRepository apiRequestRepository, CollectionRepository collectionRepository, WorkspaceMemberRepository workspaceMemberRepository, WorkspaceRepository workspaceRepository, ActivityLogService activityLogService, AuthorizationRepository authorizationRepository, WorkspaceEventService workspaceEventService,
        CollaborationService collaborationService
    ) {
        this.apiRequestRepository = apiRequestRepository;
        this.collectionRepository = collectionRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.activityLogService = activityLogService;
        this.authorizationRepository = authorizationRepository;
        this.workspaceEventService = workspaceEventService;
        this.collaborationService = collaborationService;
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

        Authorization auth = apiRequest.getAuthorization();

        if (auth != null) {
            AuthorizationResponse authDTO = new AuthorizationResponse();

            authDTO.setAuthType(auth.getAuthType());
            authDTO.setBearerToken(auth.getBearerToken());
            authDTO.setUsername(auth.getUsername());
            authDTO.setPassword(auth.getPassword());
            authDTO.setApiKeyName(auth.getApiKeyName());
            authDTO.setApiKey(auth.getApiKey());
            authDTO.setApiKeyLocation(auth.getApiKeyLocation());

            response.setAuthorization(authDTO);
        }

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

        Authorization authorization = new Authorization();

        authorization.setApiRequest(apiRequest);
        authorization.setAuthType(request.getAuthType());
        authorization.setBearerToken(request.getBearerToken());
        authorization.setUsername(request.getUsername());
        authorization.setPassword(request.getPassword());
        authorization.setApiKeyName(request.getApiKeyName());
        authorization.setApiKey(request.getApiKey());
        authorization.setApiKeyLocation(request.getApiKeyLocation());

        authorizationRepository.save(authorization);

        collaborationService.publishEvent(
                new CollaborationEvent(
                        CollaborationEventType.REQUEST_CREATED,
                        workspace.getId(),
                        ResourceType.REQUEST,
                        apiRequest.getId(),
                        apiRequest.getName(),
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
                ActivityAction.CREATED,
                ResourceType.REQUEST,
                apiRequest.getName()
        );
        workspaceEventService.sendEvent(
            workspace.getId(),
            "REQUEST_CREATED",
            "REQUEST",
            apiRequest.getName(),
            currentUser.getName()
        );
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

    public ApiRequestSummaryResponse updateRequest(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        ApiCreateRequest request) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser =
                (User) authentication.getPrincipal();


        // ==========================================
        // Workspace validation
        // ==========================================

        Workspace existsWorkspace =
                workspaceRepository.findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workspace not found"
                                ));


        // ==========================================
        // Collection validation
        // ==========================================

        Collection existsCollection =
                collectionRepository.findById(collectionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Collection not found"
                                ));


        // ==========================================
        // Request validation
        // ==========================================

        ApiRequest existsRequest =
                apiRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"
                                ));


        // ==========================================
        // Request belongs to collection
        // ==========================================

        if (!existsRequest
                .getCollection()
                .getId()
                .equals(collectionId)) {

            throw new RuntimeException(
                    "Request does not belong to the specified collection"
            );
        }


        // ==========================================
        // Collection belongs to workspace
        // ==========================================

        if (!existsCollection
                .getWorkspace()
                .getId()
                .equals(workspaceId)) {

            throw new RuntimeException(
                    "Collection does not belong to the specified workspace"
            );
        }


        // ==========================================
        // Workspace membership
        // ==========================================

        WorkspaceMember workspaceMember =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                existsWorkspace,
                                currentUser
                        );


        if (workspaceMember == null) {

            throw new RuntimeException(
                    "User is not a member of the workspace"
            );
        }


        // ==========================================
        // VIEWER cannot update
        // ==========================================

        if (workspaceMember.getRole() ==
                WorkspaceRole.VIEWER) {

            throw new RuntimeException(
                    "You do not have permission to update this request"
            );
        }


        // ==========================================
        // Update Request
        // ==========================================

        existsRequest.setName(
                request.getName()
        );

        existsRequest.setDescription(
                request.getDescription()
        );

        existsRequest.setMethod(
                request.getMethod()
        );

        existsRequest.setUrl(
                request.getUrl()
        );

        existsRequest.setBody(
                request.getBody()
        );


        ApiRequest updatedRequest =
                apiRequestRepository.save(
                        existsRequest
                );


        // ==========================================
        // Update Authorization
        // ==========================================

        Authorization authorization =
                authorizationRepository
                        .findByApiRequest(existsRequest)
                        .orElse(null);


        /*
        * If the request does not have an
        * authorization yet, create one.
        */

        if (authorization == null) {

            authorization =
                    new Authorization();

            authorization.setApiRequest(
                    existsRequest
            );
        }


        // ==========================================
        // Authorization Type
        // ==========================================

        AuthType authType =
                request.getAuthType();


        /*
        * If no auth type was supplied,
        * treat it as NONE.
        */

        if (authType == null) {

            authType = AuthType.NONE;

        }


        authorization.setAuthType(
                authType
        );


        // ==========================================
        // BEARER
        // ==========================================

        if (authType == AuthType.BEARER) {

            authorization.setBearerToken(
                    request.getBearerToken()
            );

            // Clear unrelated credentials
            authorization.setUsername(null);

            authorization.setPassword(null);

            authorization.setApiKey(null);

            authorization.setApiKeyName(null);

            authorization.setApiKeyLocation(null);
        }


        // ==========================================
        // BASIC
        // ==========================================

        else if (authType == AuthType.BASIC) {

            authorization.setBearerToken(null);

            authorization.setUsername(
                    request.getUsername()
            );

            authorization.setPassword(
                    request.getPassword()
            );

            authorization.setApiKey(null);

            authorization.setApiKeyName(null);

            authorization.setApiKeyLocation(null);
        }


        // ==========================================
        // API KEY
        // ==========================================

        else if (authType == AuthType.API_KEY) {

            authorization.setBearerToken(null);

            authorization.setUsername(null);

            authorization.setPassword(null);

            authorization.setApiKey(
                    request.getApiKey()
            );

            authorization.setApiKeyName(
                    request.getApiKeyName()
            );

            authorization.setApiKeyLocation(
                    request.getApiKeyLocation()
            );
        }


        // ==========================================
        // NONE
        // ==========================================

        else {

            authorization.setBearerToken(null);

            authorization.setUsername(null);

            authorization.setPassword(null);

            authorization.setApiKey(null);

            authorization.setApiKeyName(null);

            authorization.setApiKeyLocation(null);
        }


        // ==========================================
        // Save Authorization
        // ==========================================

        authorizationRepository.save(
                authorization
        );


        // ==========================================
        // Activity Log
        // ==========================================

        activityLogService.logActivity(
                existsWorkspace,
                currentUser,
                ActivityAction.UPDATED,
                ResourceType.REQUEST,
                existsRequest.getName()
        );


        // ==========================================
        // WebSocket Event
        // ==========================================

        workspaceEventService.sendEvent(
                existsWorkspace.getId(),
                "REQUEST_UPDATED",
                "REQUEST",
                existsRequest.getName(),
                currentUser.getName()
        );

        collaborationService.publishEvent(
                new CollaborationEvent(
                        CollaborationEventType.REQUEST_UPDATED,
                        existsWorkspace.getId(),
                        ResourceType.REQUEST,
                        updatedRequest.getId(),
                        updatedRequest.getName(),
                        currentUser.getId(),
                        currentUser.getName(),
                        LocalDateTime.now(),
                        null,
                        null
                )
        );
        // ==========================================
        // Response
        // ==========================================

        return convertToDTO(
                updatedRequest
        );
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

        String requestName =
                existsRequest.getName();


        apiRequestRepository.delete(existsRequest);

        collaborationService.publishEvent(
                new CollaborationEvent(
                        CollaborationEventType.REQUEST_DELETED,
                        workspaceId,
                        ResourceType.REQUEST,
                        requestId,
                        requestName,
                        currentUser.getId(),
                        currentUser.getName(),
                        LocalDateTime.now(),
                        null,
                        null
                )
        );

        // Saving activity logs
        activityLogService.logActivity(
                existsWorkspace,
                currentUser,
                ActivityAction.DELETED,
                ResourceType.REQUEST,
                existsRequest.getName()
        );

        workspaceEventService.sendEvent(
            existsWorkspace.getId(),
            "REQUEST_DELETED",
            "REQUEST",
            existsRequest.getName(),
            currentUser.getName()
        );
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

        collaborationService.publishEvent(
                new CollaborationEvent(
                        CollaborationEventType.REQUEST_CREATED,
                        existsWorkspace.getId(),
                        ResourceType.REQUEST,
                        duplicateRequest.getId(),
                        duplicateRequest.getName(),
                        currentUser.getId(),
                        currentUser.getName(),
                        LocalDateTime.now(),
                        null,
                        null
                )
        );

        workspaceEventService.sendEvent(
            existsWorkspace.getId(),
            "REQUEST_DUPLICATED",
            "REQUEST",
            existsRequest.getName(),
            currentUser.getName()
        );

        return convertToDTO(savedRequest);
    }

    public ApiRequestSummaryResponse moveRequest(
        Long workspaceId,
        Long sourceCollectionId,
        Long requestId,
        Long targetCollectionId
        ) {
        // Authentication
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();
        User currentUser =
                (User) authentication.getPrincipal();
        // Workspace validation

        Workspace existsWorkspace =
                workspaceRepository.findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workspace not found"
                                )
                        );

        // Source collection validation
        Collection sourceCollection =
                collectionRepository.findById(
                        sourceCollectionId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Source collection not found"
                        )
                );

        // Source collection belongs to workspace
        if (
                !sourceCollection
                        .getWorkspace()
                        .getId()
                        .equals(workspaceId)
        ) {
                throw new RuntimeException(
                        "Source collection does not belong to the specified workspace"
                );
        }

        // Target collection validation
        Collection targetCollection =
                collectionRepository.findById(
                        targetCollectionId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Target collection not found"
                        )
                );

        // Target collection belongs to workspace
        if (
                !targetCollection
                        .getWorkspace()
                        .getId()
                        .equals(workspaceId)
        ) {
                throw new RuntimeException(
                        "Target collection does not belong to the specified workspace"
                );
        }

        // Prevent moving to same collection
        if (
                sourceCollectionId
                        .equals(targetCollectionId)
        ) {
                throw new RuntimeException(
                        "Request is already in this collection"
                );
        }

        // Request validation
        ApiRequest existsRequest =
                apiRequestRepository.findById(
                        requestId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Request not found"
                        )
                );

        // Request belongs to source collection
        if (
                !existsRequest
                        .getCollection()
                        .getId()
                        .equals(sourceCollectionId)
        ) {
                throw new RuntimeException(
                        "Request does not belong to the specified collection"
                );
        }

        // Workspace membership
        WorkspaceMember workspaceMember =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                existsWorkspace,
                                currentUser
                        );
        if (workspaceMember == null) {
                throw new RuntimeException(
                        "User is not a member of the workspace"
                );
        }

        // VIEWER cannot move
        if (
                workspaceMember.getRole()
                        == WorkspaceRole.VIEWER
        ) {
                throw new RuntimeException(
                        "You do not have permission to move this request"
                );
        }

        // Move request
        existsRequest.setCollection(
                targetCollection
        );

        // Save
        ApiRequest movedRequest =
                apiRequestRepository.save(
                        existsRequest
                );

        collaborationService.publishEvent(
                new CollaborationEvent(
                        CollaborationEventType.REQUEST_MOVED,
                        existsWorkspace.getId(),
                        ResourceType.REQUEST,
                        existsRequest.getId(),
                        existsRequest.getName(),
                        currentUser.getId(),
                        currentUser.getName(),
                        LocalDateTime.now(),
                        sourceCollectionId,
                        targetCollectionId
                )
        );
        // Activity Log
        activityLogService.logActivity(
                existsWorkspace,
                currentUser,
                ActivityAction.UPDATED,
                ResourceType.REQUEST,
                existsRequest.getName()
        );

        // WebSocket Event
        workspaceEventService.sendEvent(
                existsWorkspace.getId(),
                "REQUEST_MOVED",
                "REQUEST",
                existsRequest.getName(),
                currentUser.getName()
        );

        // Return
        return convertToDTO(
                movedRequest
        );
     }
}