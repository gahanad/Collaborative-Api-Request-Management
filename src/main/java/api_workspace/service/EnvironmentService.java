package api_workspace.service;

import api_workspace.dto.environment.*;
import api_workspace.entity.*;
import api_workspace.repository.*;
import api_workspace.service.*;
import api_workspace.enums.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EnvironmentService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final EnvironmentRepository environmentRepository;
    private final ActivityLogService activityLogService;
    private final WorkspaceEventService workspaceEventService;

    public EnvironmentService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            EnvironmentRepository environmentRepository,
            WorkspaceEventService workspaceEventService,
            ActivityLogService activityLogService) {

        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.environmentRepository = environmentRepository;
        this.activityLogService = activityLogService;
        this.workspaceEventService = workspaceEventService;
    }

    // Create Environment
    public EnvironmentResponse createEnvironment(
            Long workspaceId,
            CreateEnvironmentRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException("Workspace not found"));

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }
        if (member.getRole() == WorkspaceRole.VIEWER) {
                throw new RuntimeException(
                        "Viewers cannot create environments"
                );
        }

        Environment environment = new Environment();

        environment.setName(request.getName());
        environment.setWorkspace(workspace);

        Environment saved =
                environmentRepository.save(environment);

        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.CREATED,
                ResourceType.ENVIRONMENT,
                environment.getName()
        );

        workspaceEventService.sendEvent(
                workspace.getId(),
                "ENVIRONMENT_CREATED",
                "ENVIRONMENT",
                environment.getName(),
                currentUser.getName()
        );
        return new EnvironmentResponse(
                saved.getId(),
                saved.getName(),
                saved.getWorkspace().getId()
        );
    }

    // Get All Environments
    public List<EnvironmentResponse> getAllEnvironments(
            Long workspaceId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser =
                (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException("Workspace not found"));

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        List<Environment> environments =
                environmentRepository.findByWorkspace(workspace);

        List<EnvironmentResponse> response =
                new ArrayList<>();

        for (Environment env : environments) {

            response.add(

                    new EnvironmentResponse(
                            env.getId(),
                            env.getName(),
                            env.getWorkspace().getId()
                    )
            );
        }

        return response;
    }

    // Update Environment
    public EnvironmentResponse updateEnvironment(
        Long environmentId,
        UpdateEnvironmentRequest request,
        Long workspaceId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Environment environment = environmentRepository.findById(environmentId)
                .orElseThrow(() ->
                        new RuntimeException("Environment not found"));

        Workspace workspace = environment.getWorkspace();
        if (environment.getWorkspace() == null ||
                !environment.getWorkspace()
                        .getId()
                        .equals(workspaceId)) {

        throw new RuntimeException(
                "Environment does not belong to workspace"
        );
        }
        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }
        if (member.getRole() == WorkspaceRole.VIEWER) {
                throw new RuntimeException(
                        "Viewers cannot update environments"
                );
        }

        environment.setName(request.getName());

        Environment updated =
                environmentRepository.save(environment);

        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.UPDATED,
                ResourceType.ENVIRONMENT,
                environment.getName()
        );

        workspaceEventService.sendEvent(
                workspace.getId(),
                "ENVIRONMENT_UPDATED",
                "ENVIRONMENT",
                environment.getName(),
                currentUser.getName()
        );
        return new EnvironmentResponse(
                updated.getId(),
                updated.getName(),
                updated.getWorkspace().getId()
        );
    }

    // Delete Environment
    public void deleteEnvironment(
        Long environmentId, Long workspaceId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Environment environment = environmentRepository.findById(environmentId)
                .orElseThrow(() ->
                        new RuntimeException("Environment not found"));

        Workspace workspace = environment.getWorkspace();
        if (environment.getWorkspace() == null ||
        !environment.getWorkspace()
                .getId()
                .equals(workspaceId)) {

                throw new RuntimeException(
                        "Environment does not belong to workspace"
                );
        }

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }
        if (member.getRole() == WorkspaceRole.VIEWER) {
                throw new RuntimeException(
                        "User does not have permission to delete the environment"
                );
        }
        environmentRepository.delete(environment);

        // Saving activity logs
        activityLogService.logActivity(
                workspace,
                currentUser,
                ActivityAction.DELETED,
                ResourceType.ENVIRONMENT,
                environment.getName()
        );

        workspaceEventService.sendEvent(
                workspace.getId(),
                "ENVIRONMENT_DELETED",
                "ENVIRONMENT",
                environment.getName(),
                currentUser.getName()
        );
    }
}