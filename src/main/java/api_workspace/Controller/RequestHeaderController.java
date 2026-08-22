package api_workspace.Controller;

import api_workspace.dto.header.CreateHeaderRequest;
import api_workspace.dto.header.HeaderResponse;
import api_workspace.service.RequestHeaderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class RequestHeaderController {

    private final RequestHeaderService requestHeaderService;

    public RequestHeaderController(RequestHeaderService requestHeaderService) {
        this.requestHeaderService = requestHeaderService;
    }

    @PostMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/headers")
    public ResponseEntity<HeaderResponse> createHeader(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @RequestBody CreateHeaderRequest dto){

        return ResponseEntity.ok(
                requestHeaderService.createHeader(
                        workspaceId,
                        collectionId,
                        requestId,
                        dto));
    }

    @GetMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/headers")
    public ResponseEntity<List<HeaderResponse>> getHeaders(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId){

        return ResponseEntity.ok(
                requestHeaderService.getAllHeaders(
                        workspaceId,
                        collectionId,
                        requestId));
    }

    @GetMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/headers/{headerId}")
    public ResponseEntity<HeaderResponse> getHeader(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @PathVariable Long headerId){

        return ResponseEntity.ok(
                requestHeaderService.getHeader(
                        workspaceId,
                        collectionId,
                        requestId,
                        headerId));
    }

    @PutMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/headers/{headerId}")
    public ResponseEntity<HeaderResponse> updateHeader(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @PathVariable Long headerId,
            @RequestBody CreateHeaderRequest dto){

        return ResponseEntity.ok(
                requestHeaderService.updateHeader(
                        workspaceId,
                        collectionId,
                        requestId,
                        headerId,
                        dto));
    }

    @DeleteMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/headers/{headerId}")
    public ResponseEntity<String> deleteHeader(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId,
            @PathVariable Long headerId){

        return ResponseEntity.ok(
                requestHeaderService.deleteHeader(
                        workspaceId,
                        collectionId,
                        requestId,
                        headerId));
    }
}