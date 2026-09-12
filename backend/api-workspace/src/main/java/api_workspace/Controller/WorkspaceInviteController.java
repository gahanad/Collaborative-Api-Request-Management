package api_workspace.Controller;

import api_workspace.dto.workspace.WorkspaceInviteResponse;
import api_workspace.service.WorkspaceInviteService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/workspace-invites")
public class WorkspaceInviteController {

    private final WorkspaceInviteService workspaceInviteService;

    public WorkspaceInviteController(WorkspaceInviteService workspaceInviteService) {
        this.workspaceInviteService = workspaceInviteService;
    }

    @GetMapping
    public List<WorkspaceInviteResponse> getMyInvites() {
        return workspaceInviteService.getMyInvites();
    }

    @PostMapping("/{inviteId}/accept")
    public String acceptInvite(@PathVariable Long inviteId) {
        workspaceInviteService.acceptInvite(inviteId);
        return "Invitation accepted";
    }

    @PostMapping("/{inviteId}/reject")
    public String rejectInvite(@PathVariable Long inviteId) {
        workspaceInviteService.rejectInvite(inviteId);
        return "Invitation rejected";
    }
}