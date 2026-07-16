package api_workspace.controller;

import api_workspace.dto.request.ApiCreateRequest;
import api_workspace.dto.request.ApiRequestSummaryResponse;
import api_workspace.service.ApiRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/workspaces")
public class ApiRequestController {

    private final ApiRequestService apiRequestService;

    public ApiRequestController(ApiRequestService apiRequestService) {
        this.apiRequestService = apiRequestService;
    }

    @PostMapping("/{workspaceId}/collections/{collectionId}/requests")
    public ResponseEntity<ApiRequestSummaryResponse> createRequest(

            @PathVariable Long workspaceId,

            @PathVariable Long collectionId,

            @RequestBody ApiCreateRequest request) {

        return ResponseEntity.ok(
                apiRequestService.createRequest(
                        workspaceId,
                        collectionId,
                        request));
    }

    @GetMapping("/{workspaceId}/collections/{collectionId}/getAllRequests")
    public ResponseEntity<List<ApiRequestSummaryResponse>> getAllRequests(
        @PathVariable Long workspaceId,
        @PathVariable Long collectionId
    ){
        return ResponseEntity.ok(
            apiRequestService.getAllRequests(
                workspaceId, collectionId
            )
        );
    }
}