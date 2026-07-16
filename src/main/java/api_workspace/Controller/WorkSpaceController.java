package api_workspace.controller;

import api_workspace.entity.Workspace;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.service.WorkspaceService;
import api_workspace.dto.workspace.InviteRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/workspaces")
public class WorkSpaceController{
    private final WorkspaceService workspaceService;
    public WorkSpaceController(WorkspaceService workspaceService){
        this.workspaceService = workspaceService;
    }
    @PostMapping("/createSpace")
    public String createWorkspace(@RequestBody Workspace workspace){
        workspaceService.createWorkspace(workspace);
        return "Workspace Created";
    }
    @GetMapping("/getSpace")
    public Workspace getWorkspace(@RequestParam String name){
        return workspaceService.getWorkspace(name);
    }
    @GetMapping("/getAllSpace")
    public List<Workspace> getAllWorkspace(){
        return workspaceService.getAllWorkspace();
    }
    @GetMapping("/getSpaceById")
    public Workspace getWorkspaceById(@RequestParam Long id){
        return workspaceService.getWorkspaceById(id);
    }
    @GetMapping("/deleteSpaceById")
    public String deleteById(@RequestParam Long id){
        workspaceService.deleteWorkspace(id);
        return "Workspace Deleted";
    }
    @PostMapping("/{workspaceId}/invite")
    public String inviteUserToWorkspace(@PathVariable Long workspaceId, @RequestBody InviteRequest inviteRequest){
        return workspaceService.inviteMember(workspaceId, inviteRequest);
    }
}