package api_workspace.Controller;

import api_workspace.dto.activity.ActivityLogResponse;
import api_workspace.entity.Workspace;
import api_workspace.enums.*;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.service.ActivityLogService;
import api_workspace.dto.activity.ActivityLogPageResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(
            ActivityLogService activityLogService) {

        this.activityLogService = activityLogService;
    }

    @GetMapping("/{workspaceId}/activity")
    public ResponseEntity<ActivityLogPageResponse> getLogs(

            @PathVariable Long workspaceId,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size,

            @RequestParam(
                    required = false
            )
            ActivityAction action,

            @RequestParam(
                    required = false
            )
            ResourceType resourceType
    ) {

        return ResponseEntity.ok(

                activityLogService.getActivityLogs(
                        workspaceId,
                        page,
                        size,
                        action,
                        resourceType
                )

        );
    }
}