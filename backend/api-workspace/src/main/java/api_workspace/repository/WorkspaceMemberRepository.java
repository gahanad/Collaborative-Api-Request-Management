package api_workspace.repository;

import api_workspace.entity.WorkspaceMember;
import api_workspace.entity.Workspace;
import api_workspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember, Long> {
                WorkspaceMember findByWorkspaceAndUser(Workspace workspace, User user);
                void deleteByWorkspace(Workspace workspace);
}