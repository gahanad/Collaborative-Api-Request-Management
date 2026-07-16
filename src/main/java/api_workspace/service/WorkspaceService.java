package api_workspace.service;

import api_workspace.entity.Workspace;
import api_workspace.repository.WorkspaceRepository;
import api_workspace.entity.WorkspaceMember;
import api_workspace.enums.WorkspaceRole;
import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.dto.workspace.InviteRequest;
import api_workspace.repository.UserRepository;
import api_workspace.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class WorkspaceService{
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository, WorkspaceMemberRepository workspaceMemberRepository){
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }
    public void createWorkspace(Workspace workspace){
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Object principal = authentication.getPrincipal();
        User currentUser = (User) authentication.getPrincipal();

        String email = authentication.getName();

        // User user = userRepository.findByEmail(email);

        workspace.setCreatedBy(currentUser);

        workspaceRepository.save(workspace);
        // workspaceRepository.save(workspace);
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(currentUser);
        member.setRole(WorkspaceRole.ADMIN);
        workspaceMemberRepository.save(member);
    }
    public Workspace getWorkspace(String name){
        Workspace exists = workspaceRepository.findByName(name);
        if(exists != null){
            return exists;
        }
        return null;
    }
    public List<Workspace> getAllWorkspace(){
        return workspaceRepository.findAll();
    }
    public Workspace getWorkspaceById(Long id){
        Workspace exists = workspaceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException ("Workspace not found"));
        return exists;
    }
    // For deleting the workspace based on id 
    public void deleteWorkspace(Long id) {
        if(!workspaceRepository.existsById(id)){
            throw new RuntimeException("Workspace not found");
        }
        workspaceRepository.deleteById(id);
    }

    // Inviting User to Workspace
    public String inviteMember(Long workspaceId, InviteRequest inviteRequest){
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Object principal = authentication.getPrincipal();
        User currentUser = (User) authentication.getPrincipal();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        WorkspaceMember existMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);
        if(existMember == null){
            throw new RuntimeException(
                    "You are not a member of this workspace"
            );
        }

        if(existMember.getRole() != WorkspaceRole.ADMIN){
            throw new RuntimeException(
                    "Only ADMIN can invite users"
            );
        }

        User userToInvite = userRepository.findByEmail(inviteRequest.getEmail());
        if(userToInvite == null){
            throw new RuntimeException(
                    "User not found"
            );
        }

        WorkspaceMember existing =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                userToInvite
                        );

        if(existing != null){
            throw new RuntimeException(
                    "User already exists in workspace"
            );
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(userToInvite);
        member.setRole(inviteRequest.getRole());
        workspaceMemberRepository.save(member);
        
        return "User invited successfully";
    }
}
