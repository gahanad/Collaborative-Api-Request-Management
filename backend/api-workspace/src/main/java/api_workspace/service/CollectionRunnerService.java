package api_workspace.service;

import api_workspace.dto.collectionRunner.*;
import api_workspace.dto.execution.ApiExecutionResponse;
import api_workspace.entity.*;
import api_workspace.service.*;
import api_workspace.enums.*;


import api_workspace.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;

@Service
public class CollectionRunnerService {

    private final WorkspaceRepository workspaceRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;
    private final ApiExecutionService apiExecutionService;
    private final ActivityLogService activityLogService;
    private final WorkspaceEventService workspaceEventService;

    public CollectionRunnerService(
            WorkspaceRepository workspaceRepository,
            CollectionRepository collectionRepository,
            ApiRequestRepository apiRequestRepository,
            ApiExecutionService apiExecutionService,
            WorkspaceEventService workspaceEventService,
            ActivityLogService activityLogService) {

        this.workspaceRepository = workspaceRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.apiExecutionService = apiExecutionService;
        this.activityLogService = activityLogService;
        this.workspaceEventService = workspaceEventService;
    }

    public CollectionRunnerResponse runCollection(

            Long workspaceId,

            Long collectionId,

            Long environmentId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException("Workspace not found"));

        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() ->
                        new RuntimeException("Collection not found"));

        if (!collection.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException(
                    "Collection does not belong to workspace");
        }

        List<ApiRequest> requests =
                apiRequestRepository.findByCollection(collection);

        List<RunRequestResponse> results =
                new ArrayList<>();

        int success = 0;
        int failed = 0;

        for (ApiRequest request : requests) {

            try {
                ApiExecutionResponse response =
                        apiExecutionService.executeRequest(
                                workspaceId,
                                collectionId,
                                request.getId(),
                                environmentId);

                results.add(
                        new RunRequestResponse(
                                request.getId(),
                                request.getName(),
                                response.getStatusCode(),
                                response.getResponseTime(),
                                true,
                                null
                        )
                );
                success++;
            } catch (Exception e) {
                results.add(
                        new RunRequestResponse(
                                request.getId(),
                                request.getName(),
                                500,
                                0L,
                                false,
                                e.getMessage()
                        )
                );
                failed++;
            }
        }

        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.RUN_COLLECTION,
                ResourceType.COLLECTION,
                collection.getName()
        );

        workspaceEventService.sendEvent(
                workspace.getId(),
                "COLLECTION_EXECUTED",
                "COLLECTION",
                collection.getName(),
                currentUser.getName()
        );
        return new CollectionRunnerResponse(
                collection.getName(),
                requests.size(),
                success,
                failed,
                results
        );
    }
}