package api_workspace.service;

import api_workspace.dto.activity.ActivityLogResponse;
import api_workspace.entity.*;
import api_workspace.enums.*;
import api_workspace.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(
            ActivityLogRepository activityLogRepository) {

        this.activityLogRepository = activityLogRepository;
    }

    // Save Activity
    public void logActivity(

            Workspace workspace,
            User user,
            ActivityAction action,
            ResourceType resourceType,
            String resourceName) {

        ActivityLog log = new ActivityLog();
        log.setWorkspace(workspace);
        log.setUser(user);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceName(resourceName);
        log.setCreatedAt(LocalDateTime.now());
        activityLogRepository.save(log);
    }

    // Get Activity Logs
    public List<ActivityLogResponse> getActivityLogs(
            Workspace workspace) {

        List<ActivityLog> logs =
                activityLogRepository
                        .findByWorkspaceOrderByCreatedAtDesc(workspace);

        List<ActivityLogResponse> response =
                new ArrayList<>();

        for (ActivityLog log : logs) {

            response.add(
                    new ActivityLogResponse(
                            log.getId(),
                            log.getUser().getName(),
                            log.getAction(),
                            log.getResourceType(),
                            log.getResourceName(),
                            log.getCreatedAt()
                    )
            );
        }
        return response;
    }
}