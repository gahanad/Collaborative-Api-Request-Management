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
import org.springframework.http.MediaType;

// import java.util.Collection;
// import java.util.Collection;
// import java.util.Collection;
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
    private final EnvironmentRepository environmentRepository;
    private final EnvironmentVariableRepository environmentVariableRepository;
    private final AuthorizationRepository authorizationRepository;
    private final ActivityLogService activityLogService;
    private final WorkspaceEventService workspaceEventService;
    private final WebClient webClient;

    private String replaceVariables(
        String text,
        Map<String, String> variableMap) {

        if (text == null) {
                return null;
        }

        String resolvedText = text;

        for (Map.Entry<String, String> entry : variableMap.entrySet()) {

                String variableKey = entry.getKey();
                String variableValue = entry.getValue();

                if (variableKey == null || variableKey.isBlank()) {
                continue;
                }

                if (variableValue == null) {
                variableValue = "";
                }

                resolvedText = resolvedText.replace(
                        "{{" + variableKey + "}}",
                        variableValue
                );
        }

        return resolvedText;
    }

    private void validateResolvedValue(
        String value,
        String fieldName) {

        if (value == null) {
                return;
        }

        if (value.contains("{{") || value.contains("}}")) {

                throw new RuntimeException(
                        "Unresolved environment variable in "
                                + fieldName
                                + ": "
                                + value
                );
        }
    }
    public ApiExecutionService(
            WorkspaceRepository workspaceRepository,
            CollectionRepository collectionRepository,
            ApiRequestRepository apiRequestRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            RequestHeaderRepository requestHeaderRepository,
            RequestQueryParamRepository requestQueryParamRepository,
            ExecutionHistoryRepository executionHistoryRepository,
            EnvironmentRepository environmentRepository,
            EnvironmentVariableRepository environmentVariableRepository,
            AuthorizationRepository authorizationRepository,
            ActivityLogService activityLogService,
            WorkspaceEventService workspaceEventService,
            WebClient webClient) {

        this.workspaceRepository = workspaceRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.requestHeaderRepository = requestHeaderRepository;
        this.requestQueryParamRepository = requestQueryParamRepository;
        this.executionHistoryRepository = executionHistoryRepository;
        this.environmentRepository = environmentRepository;
        this.environmentVariableRepository = environmentVariableRepository;
        this.authorizationRepository = authorizationRepository;
        this.activityLogService = activityLogService;
        this.workspaceEventService = workspaceEventService;
        this.webClient = webClient;
    }

    public ApiExecutionResponse executeRequest(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long environmentId) {

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

        // Check environment present or not
        Environment environment =
        environmentRepository.findById(environmentId)
                .orElseThrow(() ->
                        new RuntimeException("Environment not found"));
        if (environment.getWorkspace() == null) {
                throw new RuntimeException(
                        "Environment is not assigned to a workspace"
                );
        }
        if (!environment.getWorkspace()
                .getId()
                .equals(workspaceId)) {
                throw new RuntimeException(
                        "Environment does not belong to workspace"
                );
        }

        // Variables
        List<EnvironmentVariable> variables =
        environmentVariableRepository.findByEnvironment(environment);
                Map<String, String> variableMap =
                        new HashMap<>();
                for (EnvironmentVariable variable : variables) {
                if (variable.getVariableKey() == null ||
                        variable.getVariableKey().isBlank()) {

                        continue;
                }
                variableMap.put(
                        variable.getVariableKey(),
                        variable.getVariableValue()
                );
        }
        System.out.println("Variable Map: " + variableMap);
        // Build URL
        String resolvedUrl =
                replaceVariables(
                        apiRequest.getUrl(),
                        variableMap
                );

        validateResolvedValue(
                resolvedUrl,
                "request URL"
        );

        UriComponentsBuilder builder =
                UriComponentsBuilder.fromUriString(
                        resolvedUrl
                );
        // Query Parameters

        List<RequestQueryParam> queryParams =
                requestQueryParamRepository.findByApiRequest(apiRequest);

        for (RequestQueryParam param : queryParams) {

                // Disabled query parameters are NOT sent
                if (!Boolean.TRUE.equals(param.getEnabled())) {
                        continue;
                }

                String resolvedKey =
                        replaceVariables(
                                param.getParamKey(),
                                variableMap
                        );

                String resolvedValue =
                        replaceVariables(
                                param.getParamValue(),
                                variableMap
                        );

                validateResolvedValue(
                        resolvedKey,
                        "query parameter name"
                );

                validateResolvedValue(
                        resolvedValue,
                        "query parameter value"
                );

                if (resolvedKey == null ||
                        resolvedKey.isBlank()) {

                        throw new RuntimeException(
                                "Query parameter name cannot be empty"
                        );
                }

                builder.queryParam(
                        resolvedKey,
                        resolvedValue
                );
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

        // Load authorization
        Authorization authorization =
                authorizationRepository.findByApiRequest(apiRequest)
                .orElse(null);
        if (authorization != null &&
        authorization.getAuthType() == AuthType.API_KEY &&
        "QUERY".equalsIgnoreCase(
                authorization.getApiKeyLocation())) {

                String apiKeyName =
                        replaceVariables(
                                authorization.getApiKeyName(),
                                variableMap
                        );

                String apiKey =
                        replaceVariables(
                                authorization.getApiKey(),
                                variableMap
                        );

                validateResolvedValue(
                        apiKeyName,
                        "API key name"
                );

                validateResolvedValue(
                        apiKey,
                        "API key"
                );

                builder.queryParam(
                        apiKeyName,
                        apiKey
                );
        }
        WebClient.RequestHeadersSpec<?> requestSpec;
        String resolvedBody =
                replaceVariables(
                        apiRequest.getBody(),
                        variableMap
                );

        validateResolvedValue(
                resolvedBody,
                "request body"
        );
        
        if (method == HttpMethod.POST ||
                method == HttpMethod.PUT ||
                method == HttpMethod.PATCH) {

        if (resolvedBody != null &&
                !resolvedBody.isBlank()) {

                requestSpec = webClient
                        .method(method)
                        .uri(builder.build().toUri())
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .bodyValue(resolvedBody);

        } else {

                requestSpec = webClient
                        .method(method)
                        .uri(builder.build().toUri());
        }

        } else {

                /*
                * GET, DELETE, HEAD etc.
                * are sent without a request body.
                */
                requestSpec = webClient
                        .method(method)
                        .uri(builder.build().toUri());
        }
        List<RequestHeader> headers =
                requestHeaderRepository.findByApiRequest(apiRequest);

        

        requestSpec.headers(httpHeaders -> {

                // Manual Headers
                for (RequestHeader header : headers) {

                        if (Boolean.TRUE.equals(
                                header.getEnabled())) {

                        String resolvedKey =
                                replaceVariables(
                                        header.getHeaderKey(),
                                        variableMap
                                );

                        String resolvedValue =
                                replaceVariables(
                                        header.getHeaderValue(),
                                        variableMap
                                );

                        validateResolvedValue(
                                resolvedKey,
                                "header name"
                        );

                        validateResolvedValue(
                                resolvedValue,
                                "header value"
                        );

                        httpHeaders.add(
                                resolvedKey,
                                resolvedValue
                        );
                        }
                }

                // Authorization
                // ==========================================

                if (authorization != null) {
                        switch (authorization.getAuthType()) {
                                // NONE
                                case NONE:
                                // No authorization required.
                                break;
                                // BEARER

                                case BEARER:
                                String bearerToken =
                                        replaceVariables(
                                                authorization.getBearerToken(),
                                                variableMap
                                        );
                                validateResolvedValue(
                                        bearerToken,
                                        "bearer token"
                                );
                                if (bearerToken == null ||
                                        bearerToken.isBlank()) {
                                        throw new RuntimeException(
                                                "Bearer token is required"
                                        );
                                }
                                httpHeaders.setBearerAuth(
                                        bearerToken
                                );
                                break;
                                // BASIC AUTH
                                case BASIC:
                                String username =
                                        replaceVariables(
                                                authorization.getUsername(),
                                                variableMap
                                        );
                                String password =
                                        replaceVariables(
                                                authorization.getPassword(),
                                                variableMap
                                        );
                                validateResolvedValue(
                                        username,
                                        "username"
                                );
                                validateResolvedValue(
                                        password,
                                        "password"
                                );
                                if (username == null ||
                                        username.isBlank()) {
                                        throw new RuntimeException(
                                                "Username is required"
                                        );
                                }
                                if (password == null) {
                                        throw new RuntimeException(
                                                "Password is required"
                                        );
                                }
                                httpHeaders.setBasicAuth(
                                        username,
                                        password
                                );
                                break;
                                // API KEY
                                case API_KEY:
                                /*
                                * API key can be stored either:
                                * HEADER
                                * QUERY
                                * QUERY was already added to the URL
                                * above, so only HEADER is handled here.
                                */
                                if ("HEADER".equalsIgnoreCase(
                                        authorization.getApiKeyLocation())) {
                                        String apiKeyName =
                                                replaceVariables(
                                                        authorization.getApiKeyName(),
                                                        variableMap
                                                );
                                        String apiKey =
                                                replaceVariables(
                                                        authorization.getApiKey(),
                                                        variableMap
                                                );
                                        validateResolvedValue(
                                                apiKeyName,
                                                "API key name"
                                        );
                                        validateResolvedValue(
                                                apiKey,
                                                "API key"
                                        );
                                        if (apiKeyName == null ||
                                                apiKeyName.isBlank()) {
                                        throw new RuntimeException(
                                                "API key name is required"
                                        );
                                        }
                                        if (apiKey == null ||
                                                apiKey.isBlank()) {
                                        throw new RuntimeException(
                                                "API key is required"
                                        );
                                        }
                                        httpHeaders.add(
                                                apiKeyName,
                                                apiKey
                                        );
                                }
                                break;
                        }
                }
        });

        ResponseEntity<String> response;
        try {

                /*
                * IMPORTANT:
                *
                * exchangeToMono() allows us to receive
                * 4xx and 5xx responses normally.
                *
                * Example:
                *
                * Target API → 500
                *
                * We still get a ResponseEntity with:
                *
                * status = 500
                * body = target response body
                * headers = target response headers
                *
                * instead of WebClient throwing an exception.
                */

                response = requestSpec
                        .exchangeToMono(
                                clientResponse ->
                                        clientResponse.toEntity(String.class)
                        )
                        .block();

        } catch (org.springframework.web.reactive.function.client.WebClientRequestException e) {

                /*
                * This means the request could not reach
                * the target server.
                *
                * Examples:
                *
                * Connection refused
                * DNS failure
                * Network error
                */

                throw new RuntimeException(
                        "Unable to connect to the target server: "
                                + e.getMessage()
                );

        } catch (IllegalArgumentException e) {

                /*
                * Usually caused by an invalid URL.
                */

                throw new RuntimeException(
                        "Invalid request URL: "
                                + e.getMessage()
                );

        } catch (Exception e) {

                /*
                * Any unexpected execution problem.
                */

                throw new RuntimeException(
                        "Request execution failed: "
                                + e.getMessage()
                );
        }

        long end = System.currentTimeMillis();
        long responseSize = 0;

        if (response.getBody() != null) {
        responseSize =
                response.getBody()
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8)
                        .length;
        }

        ExecutionHistory history = new ExecutionHistory();

        history.setApiRequest(apiRequest);

        history.setExecutedBy(currentUser);

        history.setStatusCode(response.getStatusCode().value());

        history.setResponseBody(response.getBody());

        history.setResponseTime(end - start);

        history.setExecutedAt(LocalDateTime.now());

        executionHistoryRepository.save(history);

        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.EXECUTED,
                ResourceType.REQUEST,
                apiRequest.getName()
        );

        workspaceEventService.sendEvent(
                workspace.getId(),
                "REQUEST_EXECUTED",
                "REQUEST",
                apiRequest.getName(),
                currentUser.getName()
        );
        return new ApiExecutionResponse(
                response.getStatusCode().value(),
                response.getBody(),
                response.getHeaders(),
                end - start,
                responseSize
        );
}
}