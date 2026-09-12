package api_workspace.repository;

import api_workspace.entity.WorkspaceInvite;
import api_workspace.entity.User;
import api_workspace.entity.Workspace;
import api_workspace.enums.InviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkspaceInviteRepository extends JpaRepository<WorkspaceInvite, Long> {
    List<WorkspaceInvite> findByInvitedUserAndStatus(User invitedUser, InviteStatus status);
    Optional<WorkspaceInvite> findByWorkspaceAndInvitedUserAndStatus(Workspace workspace, User invitedUser, InviteStatus status);
}