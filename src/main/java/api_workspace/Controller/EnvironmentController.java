package api_workspace.controller;

import api_workspace.dto.environment.*;
import api_workspace.service.EnvironmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class EnvironmentController {

    private final EnvironmentService environmentService;

    public EnvironmentController(EnvironmentService environmentService) {
        this.environmentService = environmentService;
    }

    // Create Environment
    @PostMapping("/{workspaceId}/environments")
    public ResponseEntity<EnvironmentResponse> createEnvironment(

            @PathVariable Long workspaceId,

            @RequestBody CreateEnvironmentRequest request) {

        return ResponseEntity.ok(
                environmentService.createEnvironment(
                        workspaceId,
                        request
                )
        );
    }

    // Get All Environments
    @GetMapping("/{workspaceId}/environments")
    public ResponseEntity<List<EnvironmentResponse>> getAllEnvironments(

            @PathVariable Long workspaceId) {

        return ResponseEntity.ok(
                environmentService.getAllEnvironments(workspaceId)
        );
    }

    // Update Environment
    @PutMapping("/environments/{environmentId}")
    public ResponseEntity<EnvironmentResponse> updateEnvironment(

            @PathVariable Long environmentId,

            @RequestBody UpdateEnvironmentRequest request) {

        return ResponseEntity.ok(
                environmentService.updateEnvironment(
                        environmentId,
                        request
                )
        );
    }

    // Delete Environment
    @DeleteMapping("/environments/{environmentId}")
    public ResponseEntity<String> deleteEnvironment(

            @PathVariable Long environmentId) {

        environmentService.deleteEnvironment(environmentId);

        return ResponseEntity.ok("Environment deleted successfully");
    }
}