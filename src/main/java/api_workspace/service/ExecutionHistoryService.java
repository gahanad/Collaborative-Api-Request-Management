package api_workspace.service;

import api_workspace.dto.history.HistoryResponse;
import api_workspace.entity.*;
import api_workspace.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExecutionHistoryService {

    private final WorkspaceRepository workspaceRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ExecutionHistoryRepository executionHistoryRepository;

    public ExecutionHistoryService(
            WorkspaceRepository workspaceRepository,
            CollectionRepository collectionRepository,
            ApiRequestRepository apiRequestRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ExecutionHistoryRepository executionHistoryRepository) {

        this.workspaceRepository = workspaceRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.executionHistoryRepository = executionHistoryRepository;
    }

    public List<HistoryResponse> getExecutionHistory(
            Long workspaceId,
            Long collectionId,
            Long requestId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getWorkspace().getId().equals(workspaceId)) {
            throw new RuntimeException("Collection does not belong to workspace");
        }

        ApiRequest apiRequest = apiRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!apiRequest.getCollection().getId().equals(collectionId)) {
            throw new RuntimeException("Request does not belong to collection");
        }

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        List<ExecutionHistory> historyList =
                executionHistoryRepository.findByApiRequestOrderByExecutedAtDesc(apiRequest);

        List<HistoryResponse> response = new ArrayList<>();

        for (ExecutionHistory history : historyList) {

            response.add(
                    new HistoryResponse(
                            history.getId(),
                            history.getStatusCode(),
                            history.getResponseTime(),
                            history.getExecutedAt(),
                            history.getResponseBody()
                    )
            );
        }

        return response;
    }

//     Delete a history
    @Transactional
    public void deleteHistory(
                Long workspaceId,
                Long collectionId,
                Long requestId,
                Long historyId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser =
                (User) authentication.getPrincipal();


        Workspace workspace =
                workspaceRepository
                        .findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workspace not found"
                                ));


        Collection collection =
                collectionRepository
                        .findById(collectionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Collection not found"
                                ));


        if (!collection.getWorkspace()
                .getId()
                .equals(workspaceId)) {

                throw new RuntimeException(
                        "Collection does not belong to workspace"
                );
        }


        ApiRequest apiRequest =
                apiRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"
                                ));


        if (!apiRequest.getCollection()
                .getId()
                .equals(collectionId)) {

                throw new RuntimeException(
                        "Request does not belong to collection"
                );
        }


        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                currentUser
                        );


        if (member == null) {

                throw new RuntimeException(
                        "User is not a workspace member"
                );
        }


        ExecutionHistory history =
                executionHistoryRepository
                        .findById(historyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Execution history not found"
                                ));


        if (!history.getApiRequest()
                .getId()
                .equals(requestId)) {

                throw new RuntimeException(
                        "History does not belong to request"
                );
        }


        executionHistoryRepository.delete(
                history
        );
    }

//     Clear History
    @Transactional
    public void clearHistory(
                Long workspaceId,
                Long collectionId,
                Long requestId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser =
                (User) authentication
                        .getPrincipal();


        Workspace workspace =
                workspaceRepository
                        .findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workspace not found"
                                ));


        Collection collection =
                collectionRepository
                        .findById(collectionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Collection not found"
                                ));


        if (!collection.getWorkspace()
                .getId()
                .equals(workspaceId)) {

                throw new RuntimeException(
                        "Collection does not belong to workspace"
                );
        }


        ApiRequest apiRequest =
                apiRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"
                                ));


        if (!apiRequest.getCollection()
                .getId()
                .equals(collectionId)) {

                throw new RuntimeException(
                        "Request does not belong to collection"
                );
        }


        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                currentUser
                        );


        if (member == null) {

                throw new RuntimeException(
                        "User is not a workspace member"
                );
        }


        executionHistoryRepository
                .deleteByApiRequest(
                        apiRequest
                );
   }
}