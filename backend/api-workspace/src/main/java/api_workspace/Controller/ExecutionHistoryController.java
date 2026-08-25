package api_workspace.Controller;

import api_workspace.dto.history.HistoryResponse;
import api_workspace.service.ExecutionHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class ExecutionHistoryController {

    private final ExecutionHistoryService executionHistoryService;

    public ExecutionHistoryController(
            ExecutionHistoryService executionHistoryService) {

        this.executionHistoryService = executionHistoryService;
    }

    @GetMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/history")
    public ResponseEntity<List<HistoryResponse>> getExecutionHistory(

            @PathVariable Long workspaceId,

            @PathVariable Long collectionId,

            @PathVariable Long requestId) {

        return ResponseEntity.ok(

                executionHistoryService.getExecutionHistory(

                        workspaceId,

                        collectionId,

                        requestId
                )
        );
    }

    // Delete History
    @DeleteMapping(
        "/{workspaceId}/collections/{collectionId}/requests/{requestId}/history/{historyId}")
    public ResponseEntity<Void> deleteHistory(

            @PathVariable Long workspaceId,

            @PathVariable Long collectionId,

            @PathVariable Long requestId,

            @PathVariable Long historyId) {

        executionHistoryService.deleteHistory(
                workspaceId,
                collectionId,
                requestId,
                historyId
        );

        return ResponseEntity.noContent().build();
    }


    @DeleteMapping(
        "/{workspaceId}/collections/{collectionId}/requests/{requestId}/history")
    public ResponseEntity<Void> clearHistory(

            @PathVariable Long workspaceId,

            @PathVariable Long collectionId,

            @PathVariable Long requestId) {

        executionHistoryService.clearHistory(
                workspaceId,
                collectionId,
                requestId
        );

        return ResponseEntity.noContent().build();
    }
}