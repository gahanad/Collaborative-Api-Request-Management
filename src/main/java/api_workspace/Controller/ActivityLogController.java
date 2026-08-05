package api_workspace.controller;

import api_workspace.dto.activity.ActivityLogResponse;
import api_workspace.entity.Workspace;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class ActivityLogController {

    private final ActivityLogService activityLogService;
    private final WorkspaceRepository workspaceRepository;

    public ActivityLogController(
            ActivityLogService activityLogService,
            WorkspaceRepository workspaceRepository) {

        this.activityLogService = activityLogService;
        this.workspaceRepository = workspaceRepository;
    }

    @GetMapping("/{workspaceId}/activity")
    public ResponseEntity<List<ActivityLogResponse>> getLogs(
            @PathVariable Long workspaceId) {

        Workspace workspace =
                workspaceRepository.findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException("Workspace not found"));

        return ResponseEntity.ok(
                activityLogService.getActivityLogs(workspace)
        );
    }
}