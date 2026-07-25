package api_workspace.service;

import api_workspace.dto.execution.*;
import api_workspace.entity.*;
import api_workspace.repository.*;
import api_workspace.enums.*;
import java.time.LocalDateTime;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApiExecutionService {

    private final WorkspaceRepository workspaceRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final RequestHeaderRepository requestHeaderRepository;
    private final RequestQueryParamRepository requestQueryParamRepository;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final WebClient webClient;

    public ApiExecutionService(
            WorkspaceRepository workspaceRepository,
            CollectionRepository collectionRepository,
            ApiRequestRepository apiRequestRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            RequestHeaderRepository requestHeaderRepository,
            RequestQueryParamRepository requestQueryParamRepository,
            ExecutionHistoryRepository executionHistoryRepository,
            WebClient webClient) {

        this.workspaceRepository = workspaceRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.requestHeaderRepository = requestHeaderRepository;
        this.requestQueryParamRepository = requestQueryParamRepository;
        this.executionHistoryRepository = executionHistoryRepository;
        this.webClient = webClient;
    }

    public ApiExecutionResponse executeRequest(
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

        // Build URL
        UriComponentsBuilder builder =
                UriComponentsBuilder.fromUriString(apiRequest.getUrl());

        List<RequestQueryParam> queryParams =
                requestQueryParamRepository.findByApiRequest(apiRequest);

        for (RequestQueryParam param : queryParams) {

                if (Boolean.TRUE.equals(param.getEnabled())) {

                builder.queryParam(
                        param.getParamKey(),
                        param.getParamValue());
                }
        }

        HttpMethod method = switch (apiRequest.getMethod()) {
                case GET -> HttpMethod.GET;
                case POST -> HttpMethod.POST;
                case PUT -> HttpMethod.PUT;
                case PATCH -> HttpMethod.PATCH;
                case DELETE -> HttpMethod.DELETE;
                default -> throw new RuntimeException("Unsupported HTTP method");
        };

        long start = System.currentTimeMillis();

        WebClient.RequestHeadersSpec<?> requestSpec;

        if (method == HttpMethod.POST ||
                method == HttpMethod.PUT ||
                method == HttpMethod.PATCH) {

                requestSpec = webClient
                        .method(method)
                        .uri(builder.build().toUri())
                        .bodyValue(apiRequest.getBody());

        } else {

                requestSpec = webClient
                        .method(method)
                        .uri(builder.build().toUri());
        }

        List<RequestHeader> headers =
                requestHeaderRepository.findByApiRequest(apiRequest);

        requestSpec.headers(httpHeaders -> {

                for (RequestHeader header : headers) {

                if (Boolean.TRUE.equals(header.getEnabled())) {

                        httpHeaders.add(
                                header.getHeaderKey(),
                                header.getHeaderValue());
                }
                }
        });

        ResponseEntity<String> response =
                requestSpec
                        .retrieve()
                        .toEntity(String.class)
                        .block();

        long end = System.currentTimeMillis();

        ExecutionHistory history = new ExecutionHistory();

        history.setApiRequest(apiRequest);

        history.setExecutedBy(currentUser);

        history.setStatusCode(response.getStatusCode().value());

        history.setResponseBody(response.getBody());

        history.setResponseTime(end - start);

        history.setExecutedAt(LocalDateTime.now());

        executionHistoryRepository.save(history);

        return new ApiExecutionResponse(
                response.getStatusCode().value(),
                response.getBody(),
                response.getHeaders(),
                end - start
        );
    }
}