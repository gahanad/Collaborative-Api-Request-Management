package api_workspace.controller;

import api_workspace.dto.collectionRunner.CollectionRunnerResponse;
import api_workspace.service.CollectionRunnerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/workspaces")
public class CollectionRunnerController {

    private final CollectionRunnerService collectionRunnerService;

    public CollectionRunnerController(
            CollectionRunnerService collectionRunnerService) {

        this.collectionRunnerService = collectionRunnerService;
    }

    @PostMapping("/{workspaceId}/collections/{collectionId}/run/{environmentId}")
    public ResponseEntity<CollectionRunnerResponse> runCollection(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long environmentId) {

        return ResponseEntity.ok(
                collectionRunnerService.runCollection(
                        workspaceId,
                        collectionId,
                        environmentId)
        );
    }
}