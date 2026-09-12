package api_workspace.service;

import api_workspace.entity.*;
import api_workspace.enums.InviteStatus;
import api_workspace.repository.*;
import api_workspace.dto.workspace.WorkspaceInviteResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceInviteService {

    private final WorkspaceInviteRepository workspaceInviteRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceEventService workspaceEventService;

    public WorkspaceInviteService(WorkspaceInviteRepository workspaceInviteRepository, 
                                  WorkspaceMemberRepository workspaceMemberRepository,
                                  WorkspaceEventService workspaceEventService) {
        this.workspaceInviteRepository = workspaceInviteRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceEventService = workspaceEventService;
    }

    public List<WorkspaceInviteResponse> getMyInvites() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        return workspaceInviteRepository.findByInvitedUserAndStatus(currentUser, InviteStatus.PENDING)
                .stream().map(invite -> {
                    WorkspaceInviteResponse response = new WorkspaceInviteResponse();
                    response.setId(invite.getId());
                    response.setWorkspaceName(invite.getWorkspace().getName());
                    response.setInvitedByName(invite.getInvitedBy().getName());
                    response.setRole(invite.getRole().name());
                    response.setStatus(invite.getStatus().name());
                    response.setCreatedAt(invite.getCreatedAt());
                    return response;
                }).collect(Collectors.toList());
    }

    @Transactional
    public void acceptInvite(Long inviteId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        WorkspaceInvite invite = workspaceInviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!invite.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You cannot accept this invitation");
        }
        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new RuntimeException("Invitation is no longer pending");
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(invite.getWorkspace());
        member.setUser(currentUser);
        member.setRole(invite.getRole());
        workspaceMemberRepository.save(member);

        invite.setStatus(InviteStatus.ACCEPTED);
        workspaceInviteRepository.save(invite);

        workspaceEventService.sendEvent(
            invite.getWorkspace().getId(),
            "MEMBER_JOINED",
            "MEMBER",
            currentUser.getName(),
            currentUser.getName()
        );
    }

    @Transactional
    public void rejectInvite(Long inviteId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        WorkspaceInvite invite = workspaceInviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!invite.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You cannot reject this invitation");
        }
        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new RuntimeException("Invitation is no longer pending");
        }

        invite.setStatus(InviteStatus.REJECTED);
        workspaceInviteRepository.save(invite);
    }
}