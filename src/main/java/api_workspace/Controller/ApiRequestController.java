package api_workspace.Controller;

import api_workspace.dto.request.ApiCreateRequest;
import api_workspace.dto.request.ApiRequestSummaryResponse;
import api_workspace.service.ApiRequestService;
import api_workspace.dto.request.MoveRequestRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;


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
            @Valid
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

    @GetMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}")
    public ResponseEntity<ApiRequestSummaryResponse> getRequest(
        @PathVariable Long workspaceId,
        @PathVariable Long collectionId,
        @PathVariable Long requestId
    ){
        return ResponseEntity.ok(
            apiRequestService.getRequest(
                workspaceId, collectionId, requestId
            )
        );
    }

    @PutMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}")
    public ResponseEntity<ApiRequestSummaryResponse> updateRequest(
        @PathVariable Long workspaceId,
        @PathVariable Long collectionId,
        @PathVariable Long requestId,
        @Valid
        @RequestBody ApiCreateRequest request
    ){
        return ResponseEntity.ok(
            apiRequestService.updateRequest(
                workspaceId, collectionId, requestId, request
            )
        );
    }

    @DeleteMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}")
    public ResponseEntity<String> deleteRequest(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                apiRequestService.deleteRequest(
                        workspaceId,
                        collectionId,
                        requestId));
    }

    @PostMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/duplicate")
    public ResponseEntity<ApiRequestSummaryResponse> duplicateRequest(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                apiRequestService.duplicateRequest(
                        workspaceId,
                        collectionId,
                        requestId));
    }

    @PatchMapping(
        "/{workspaceId}/collections/{collectionId}/requests/{requestId}/move")
    public ResponseEntity<ApiRequestSummaryResponse> moveRequest(

            @PathVariable Long workspaceId,

            @PathVariable Long collectionId,

            @PathVariable Long requestId,

            @RequestBody MoveRequestRequest request

    ) {

        return ResponseEntity.ok(

                apiRequestService.moveRequest(

                        workspaceId,

                        collectionId,

                        requestId,

                        request.getTargetCollectionId()

                )

        );
    }
}