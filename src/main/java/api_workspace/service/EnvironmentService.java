package api_workspace.service;

import api_workspace.dto.environment.*;
import api_workspace.entity.*;
import api_workspace.repository.*;

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

    public EnvironmentService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            EnvironmentRepository environmentRepository) {

        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.environmentRepository = environmentRepository;
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

        Environment environment = new Environment();

        environment.setName(request.getName());
        environment.setWorkspace(workspace);

        Environment saved =
                environmentRepository.save(environment);

        return new EnvironmentResponse(
                saved.getId(),
                saved.getName()
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

                            env.getName()
                    )
            );
        }

        return response;
    }

    // Update Environment
    public EnvironmentResponse updateEnvironment(
        Long environmentId,
        UpdateEnvironmentRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Environment environment = environmentRepository.findById(environmentId)
                .orElseThrow(() ->
                        new RuntimeException("Environment not found"));

        Workspace workspace = environment.getWorkspace();

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        environment.setName(request.getName());

        Environment updated =
                environmentRepository.save(environment);

        return new EnvironmentResponse(
                updated.getId(),
                updated.getName()
        );
    }

    // Delete Environment
    public void deleteEnvironment(
        Long environmentId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Environment environment = environmentRepository.findById(environmentId)
                .orElseThrow(() ->
                        new RuntimeException("Environment not found"));

        Workspace workspace = environment.getWorkspace();

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser
                );

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }
        if(member.getRole().equals("VIEWER")){
            throw new RuntimeException("User does not have permission to delete the collection");
        }
        environmentRepository.delete(environment);
    }
}