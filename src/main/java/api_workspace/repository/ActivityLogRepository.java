package api_workspace.repository;

import api_workspace.entity.ActivityLog;
import api_workspace.enums.ActivityAction;
import api_workspace.enums.ResourceType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {


    Page<ActivityLog>
    findByWorkspaceIdOrderByCreatedAtDesc(
            Long workspaceId,
            Pageable pageable
    );


    Page<ActivityLog>
    findByWorkspaceIdAndActionOrderByCreatedAtDesc(
            Long workspaceId,
            ActivityAction action,
            Pageable pageable
    );


    Page<ActivityLog>
    findByWorkspaceIdAndResourceTypeOrderByCreatedAtDesc(
            Long workspaceId,
            ResourceType resourceType,
            Pageable pageable
    );


    Page<ActivityLog>
    findByWorkspaceIdAndActionAndResourceTypeOrderByCreatedAtDesc(
            Long workspaceId,
            ActivityAction action,
            ResourceType resourceType,
            Pageable pageable
    );
}