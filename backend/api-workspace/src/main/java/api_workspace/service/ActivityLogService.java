package api_workspace.service;

import api_workspace.dto.activity.*;
import api_workspace.entity.*;
import api_workspace.enums.*;
import api_workspace.repository.ActivityLogRepository;
import api_workspace.repository.AuthorizationRepository;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.repository.WorkspaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final AuthorizationRepository authorizationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ActivityLogService(
            ActivityLogRepository activityLogRepository,
            AuthorizationRepository authorizationRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository) {

        this.activityLogRepository = activityLogRepository;
        this.authorizationRepository = authorizationRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    // Save Activity
    public void logActivity(

            Workspace workspace,
            User user,
            ActivityAction action,
            ResourceType resourceType,
            String resourceName) {

        ActivityLog log = new ActivityLog();
        log.setWorkspaceId(workspace.getId());
        log.setWorkspaceName(workspace.getName());

        log.setUser(user);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceName(resourceName);
        log.setCreatedAt(LocalDateTime.now());
        activityLogRepository.save(log);
    }

    
    // Get Activity Logs
    public ActivityLogPageResponse getActivityLogs(
                Long workspaceId,
                int page,
                int size,
                ActivityAction action,
                ResourceType resourceType) {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        User currentUser =
                (User) authentication.getPrincipal();


        Workspace workspace =
                workspaceRepository.findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workspace not found"
                                ));


        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                currentUser
                        );


        if (member == null) {

                throw new RuntimeException(
                        "User is not a workspace member"
                );
        }

        // ==========================================
        // Validate pagination
        // ==========================================

        if (page < 0) {
                throw new RuntimeException(
                        "Page cannot be negative"
                );
        }


        if (size <= 0) {
                throw new RuntimeException(
                        "Page size must be greater than zero"
                );
        }


        // Prevent somebody from requesting
        // an unnecessarily huge page.

        if (size > 100) {
                size = 100;
        }


        // ==========================================
        // Pageable
        // ==========================================

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );


        // ==========================================
        // Fetch according to filters
        // ==========================================

        Page<ActivityLog> logs;


        if (
                action != null &&
                resourceType != null
        ) {

                logs =
                        activityLogRepository
                                .findByWorkspaceIdAndActionAndResourceTypeOrderByCreatedAtDesc(
                                        workspaceId,
                                        action,
                                        resourceType,
                                        pageable
                                );

        }

        else if (action != null) {

                logs =
                        activityLogRepository
                                .findByWorkspaceIdAndActionOrderByCreatedAtDesc(
                                        workspaceId,
                                        action,
                                        pageable
                                );

        }

        else if (resourceType != null) {

                logs =
                        activityLogRepository
                                .findByWorkspaceIdAndResourceTypeOrderByCreatedAtDesc(
                                        workspaceId,
                                        resourceType,
                                        pageable
                                );

        }

        else {

                logs =
                        activityLogRepository
                                .findByWorkspaceIdOrderByCreatedAtDesc(
                                        workspaceId,
                                        pageable
                                );
        }


        // ==========================================
        // Convert entities → DTOs
        // ==========================================

        List<ActivityLogResponse> response =
                new ArrayList<>();


        for (ActivityLog log :
                logs.getContent()) {

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


        // ==========================================
        // Return pagination response
        // ==========================================

        return new ActivityLogPageResponse(

                response,

                logs.getNumber(),

                logs.getSize(),

                logs.getTotalElements(),

                logs.getTotalPages(),

                logs.isFirst(),

                logs.isLast()
        );
    }
}