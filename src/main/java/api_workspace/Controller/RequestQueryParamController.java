package api_workspace.controller;

import api_workspace.dto.queryparam.CreateQueryParamRequest;
import api_workspace.dto.queryparam.QueryParamResponse;
import api_workspace.service.RequestQueryParamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class RequestQueryParamController {

    private final RequestQueryParamService requestQueryParamService;

    public RequestQueryParamController(RequestQueryParamService requestQueryParamService) {
        this.requestQueryParamService = requestQueryParamService;
    }

    @PostMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/query-params")
    public ResponseEntity<QueryParamResponse> createQueryParam(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @RequestBody CreateQueryParamRequest dto){

        return ResponseEntity.ok(
                requestQueryParamService.createQueryParam(
                        workspaceId,
                        collectionId,
                        requestId,
                        dto));
    }

    @GetMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/query-params")
    public ResponseEntity<List<QueryParamResponse>> getAllQueryParams(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId){

        return ResponseEntity.ok(
                requestQueryParamService.getAllQueryParams(
                        workspaceId,
                        collectionId,
                        requestId));
    }

    @GetMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/query-params/{paramId}")
    public ResponseEntity<QueryParamResponse> getQueryParam(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @PathVariable Long paramId){

        return ResponseEntity.ok(
                requestQueryParamService.getQueryParam(
                        workspaceId,
                        collectionId,
                        requestId,
                        paramId));
    }

    @PutMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/query-params/{paramId}")
    public ResponseEntity<QueryParamResponse> updateQueryParam(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @PathVariable Long paramId,
            @RequestBody CreateQueryParamRequest dto){

        return ResponseEntity.ok(
                requestQueryParamService.updateQueryParam(
                        workspaceId,
                        collectionId,
                        requestId,
                        paramId,
                        dto));
    }

    @DeleteMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/query-params/{paramId}")
    public ResponseEntity<String> deleteQueryParam(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @PathVariable Long paramId){

        return ResponseEntity.ok(
                requestQueryParamService.deleteQueryParam(
                        workspaceId,
                        collectionId,
                        requestId,
                        paramId));
    }
}