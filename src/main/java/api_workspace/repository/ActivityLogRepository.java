package api_workspace.repository;

import api_workspace.entity.ActivityLog;
import api_workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByWorkspaceOrderByCreatedAtDesc(
            Workspace workspace);
}