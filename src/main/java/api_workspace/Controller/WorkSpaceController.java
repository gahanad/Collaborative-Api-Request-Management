package api_workspace.controller;

import api_workspace.entity.Workspace;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.service.WorkspaceService;
import api_workspace.dto.workspace.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/workspaces")
public class WorkSpaceController{
    private final WorkspaceService workspaceService;
    public WorkSpaceController(WorkspaceService workspaceService){
        this.workspaceService = workspaceService;
    }
    @PostMapping
    public String createWorkspace(
        @Valid
        @RequestBody WorkspaceCreateRequest workspace){
        // workspaceService.createWorkspace(workspace);
        return workspaceService.createWorkspace(workspace);;
    }
    @GetMapping("/getSpace")
    public Workspace getWorkspace(@RequestParam String name){
        return workspaceService.getWorkspace(name);
    }
    @GetMapping
    public List<WorkspaceSummary> getAllWorkspace(){
        return workspaceService.getAllWorkspace();
    }
    @GetMapping("/{workspaceId}")
    public WorkspaceSummary getWorkspaceById(@PathVariable Long workspaceId){
        return workspaceService.getWorkspaceById(workspaceId);
    }
    @DeleteMapping("/{workspaceId}")
    public String deleteById(@PathVariable Long workspaceId){
        workspaceService.deleteWorkspace(workspaceId);
        return "Workspace Deleted";
    }
    @PostMapping("/{workspaceId}/invite")
    public String inviteUserToWorkspace(@PathVariable Long workspaceId, @RequestBody InviteRequest inviteRequest){
        return workspaceService.inviteMember(workspaceId, inviteRequest);
    }
}