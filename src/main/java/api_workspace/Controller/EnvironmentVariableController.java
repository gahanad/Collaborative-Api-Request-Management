package api_workspace.controller;

import api_workspace.dto.environment.*;
import api_workspace.service.EnvironmentVariableService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/environments")
public class EnvironmentVariableController {

    private final EnvironmentVariableService environmentVariableService;

    public EnvironmentVariableController(
            EnvironmentVariableService environmentVariableService) {

        this.environmentVariableService = environmentVariableService;
    }

    // Create Variable
    @PostMapping("/{environmentId}/variables")
    public ResponseEntity<EnvironmentVariableResponse> createVariable(
            @Valid
            @PathVariable Long environmentId,

            @RequestBody CreateEnvironmentVariableRequest request) {

        return ResponseEntity.ok(
                environmentVariableService.createVariable(
                        environmentId,
                        request
                )
        );
    }

    // Get All Variables
    @GetMapping("/{environmentId}/variables")
    public ResponseEntity<List<EnvironmentVariableResponse>> getVariables(

            @PathVariable Long environmentId) {

        return ResponseEntity.ok(
                environmentVariableService.getVariables(environmentId)
        );
    }

    // Update Variable
    @PutMapping("/variables/{variableId}")
    public ResponseEntity<EnvironmentVariableResponse> updateVariable(

            @PathVariable Long variableId,

            @RequestBody UpdateEnvironmentVariableRequest request) {

        return ResponseEntity.ok(
                environmentVariableService.updateVariable(
                        variableId,
                        request
                )
        );
    }

    // Delete Variable
    @DeleteMapping("/variables/{variableId}")
    public ResponseEntity<String> deleteVariable(

            @PathVariable Long variableId) {

        environmentVariableService.deleteVariable(variableId);

        return ResponseEntity.ok("Variable deleted successfully");
    }
}