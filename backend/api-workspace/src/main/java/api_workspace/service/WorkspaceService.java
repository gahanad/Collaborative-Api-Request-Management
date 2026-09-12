package api_workspace.service;

import api_workspace.entity.Workspace;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.service.*;
import api_workspace.entity.WorkspaceMember;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.dto.workspace.*;
import api_workspace.repository.UserRepository;
import api_workspace.repository.WorkspaceInviteRepository;
import api_workspace.entity.User;
import api_workspace.enums.*;
import api_workspace.entity.WorkspaceInvite;

import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class WorkspaceService{
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ActivityLogService activityLogService;
    private final WorkspaceEventService workspaceEventService;
    private final WorkspaceInviteRepository workspaceInviteRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, 
        WorkspaceEventService workspaceEventService,
        UserRepository userRepository, WorkspaceMemberRepository workspaceMemberRepository, ActivityLogService activityLogService, WorkspaceInviteRepository workspaceInviteRepository){
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.activityLogService = activityLogService;
        this.workspaceEventService = workspaceEventService;
        this.workspaceInviteRepository = workspaceInviteRepository;
    }

    private WorkspaceSummary convertToSummary(Workspace workspace){

        WorkspaceSummary response = new WorkspaceSummary();
        response.setId(workspace.getId());
        response.setName(workspace.getName());
        response.setDescription(workspace.getDescription());
        response.setCreatedAt(workspace.getCreatedAt());
        return response;
    }
    public WorkspaceSummary createWorkspace(WorkspaceCreateRequest request){
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Object principal = authentication.getPrincipal();
        User currentUser = (User) authentication.getPrincipal();

        String email = authentication.getName();
        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        // User user = userRepository.findByEmail(email);

        // Workspace workspace = workspaceRepository.findById(workspaceId)
        //         .orElseThrow(() -> new RuntimeException("Workspace not found"));
        workspace.setCreatedBy(currentUser);


        workspaceRepository.save(workspace);
        // workspaceRepository.save(workspace);
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(currentUser);
        member.setRole(WorkspaceRole.ADMIN);
        workspaceMemberRepository.save(member);

        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.CREATED,
                ResourceType.WORKSPACE,
                workspace.getName()
        );

        workspaceEventService.sendEvent(
            workspace.getId(),
            "WORKSPACE_CREATED",
            "WORKSPACE",
            workspace.getName(),
            currentUser.getName()
        );

        WorkspaceSummary response = new WorkspaceSummary();
        response.setId(workspace.getId());
        response.setName(workspace.getName());
        response.setDescription(workspace.getDescription());
        response.setCreatedAt(workspace.getCreatedAt());

        return response;
    }
    
    public List<WorkspaceSummary> getAllWorkspace(){
        List<Workspace> workspaces = workspaceRepository.findAll();

        return workspaces.stream()
                .map(this::convertToSummary)
                .toList();
    }
    public WorkspaceDetailResponse getWorkspaceById(Long id){
        Workspace workspace = workspaceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Workspace not found"));

        WorkspaceDetailResponse response = new WorkspaceDetailResponse();

        response.setId(workspace.getId());
        response.setName(workspace.getName());
        response.setDescription(workspace.getDescription());
        response.setCreatedAt(workspace.getCreatedAt());

        return response;
    }
    // For deleting the workspace based on id 
    @Transactional
    public void deleteWorkspace(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        workspaceMemberRepository.deleteByWorkspace(workspace);
        // Log BEFORE deleting
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.DELETED,
                ResourceType.WORKSPACE,
                workspace.getName()
        );
        workspaceRepository.delete(workspace);

        workspaceEventService.sendEvent(
            workspace.getId(),
            "WORKSPACE_DELETED",
            "WORKSPACE",
            workspace.getName(),
            currentUser.getName()
        );
    }

    // Inviting User to Workspace
        // Inviting User to Workspace (Changed to Invitation Request System)
    public String inviteMember(Long workspaceId, InviteRequest inviteRequest){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
                
        WorkspaceMember existMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);
        if(existMember == null || existMember.getRole() != WorkspaceRole.ADMIN){
            throw new RuntimeException("Only ADMIN can invite users");
        }

        User userToInvite = userRepository.findByEmail(inviteRequest.getEmail());
        if(userToInvite == null){
            throw new RuntimeException("User not found");
        }

        WorkspaceMember existing = workspaceMemberRepository.findByWorkspaceAndUser(workspace, userToInvite);
        if(existing != null){
            throw new RuntimeException("User already exists in workspace");
        }

        // Check if a pending invite already exists
        java.util.Optional<api_workspace.entity.WorkspaceInvite> pendingInvite = 
            workspaceInviteRepository.findByWorkspaceAndInvitedUserAndStatus(
                workspace, userToInvite, api_workspace.enums.InviteStatus.PENDING
            );
            
        if (pendingInvite.isPresent()) {
            throw new RuntimeException("A pending invitation already exists for this user");
        }

        WorkspaceInvite invite = new WorkspaceInvite();
        invite.setWorkspace(workspace);
        invite.setInvitedUser(userToInvite);
        invite.setInvitedBy(currentUser);
        invite.setRole(inviteRequest.getRole());
        workspaceInviteRepository.save(invite);
        
        return "Invitation sent successfully";
    }
}
