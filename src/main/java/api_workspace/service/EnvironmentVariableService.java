package api_workspace.service;

import api_workspace.dto.environment.*;
import api_workspace.entity.*;
import api_workspace.enums.WorkspaceRole;
import api_workspace.repository.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EnvironmentVariableService {

    private final EnvironmentRepository environmentRepository;
    private final EnvironmentVariableRepository environmentVariableRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public EnvironmentVariableService(
            EnvironmentRepository environmentRepository,
            EnvironmentVariableRepository environmentVariableRepository,
            WorkspaceMemberRepository workspaceMemberRepository) {

        this.environmentRepository = environmentRepository;
        this.environmentVariableRepository = environmentVariableRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    // Create Variable
    public EnvironmentVariableResponse createVariable(
            Long environmentId,
            CreateEnvironmentVariableRequest request) {

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
                        currentUser);

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        if (member.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("Viewers cannot create variables");
        }

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setVariableKey(request.getVariableKey());
        variable.setVariableValue(request.getVariableValue());
        variable.setEnvironment(environment);

        EnvironmentVariable saved =
                environmentVariableRepository.save(variable);

        return new EnvironmentVariableResponse(
                saved.getId(),
                saved.getVariableKey(),
                saved.getVariableValue()
        );
    }

    // Get All Variables
    public List<EnvironmentVariableResponse> getVariables(
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
                        currentUser);

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        List<EnvironmentVariable> variables =
                environmentVariableRepository.findByEnvironment(environment);

        List<EnvironmentVariableResponse> response =
                new ArrayList<>();

        for (EnvironmentVariable variable : variables) {

            response.add(
                    new EnvironmentVariableResponse(
                            variable.getId(),
                            variable.getVariableKey(),
                            variable.getVariableValue()
                    )
            );
        }

        return response;
    }

    // Update Variable
    public EnvironmentVariableResponse updateVariable(
            Long variableId,
            UpdateEnvironmentVariableRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        EnvironmentVariable variable =
                environmentVariableRepository.findById(variableId)
                        .orElseThrow(() ->
                                new RuntimeException("Variable not found"));

        Workspace workspace =
                variable.getEnvironment().getWorkspace();

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser);

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        if (member.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("Viewers cannot update variables");
        }

        variable.setVariableKey(request.getVariableKey());
        variable.setVariableValue(request.getVariableValue());

        EnvironmentVariable updated =
                environmentVariableRepository.save(variable);

        return new EnvironmentVariableResponse(
                updated.getId(),
                updated.getVariableKey(),
                updated.getVariableValue()
        );
    }

    // Delete Variable
    public void deleteVariable(Long variableId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        EnvironmentVariable variable =
                environmentVariableRepository.findById(variableId)
                        .orElseThrow(() ->
                                new RuntimeException("Variable not found"));

        Workspace workspace =
                variable.getEnvironment().getWorkspace();

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(
                        workspace,
                        currentUser);

        if (member == null) {
            throw new RuntimeException("User is not a workspace member");
        }

        if (member.getRole() == WorkspaceRole.VIEWER) {
            throw new RuntimeException("Viewers cannot delete variables");
        }

        environmentVariableRepository.delete(variable);
    }
}