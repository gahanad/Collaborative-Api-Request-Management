package api_workspace.controller;

import api_workspace.service.*;
import api_workspace.dto.execution.*;
import api_workspace.dto.request.*;
import api_workspace.entity.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class ApiExecutionController{
    
    private final ApiExecutionService apiExecutionService;
    public ApiExecutionController(ApiExecutionService apiExecutionService){
        System.out.println("Execute endpoint hit");
        this.apiExecutionService = apiExecutionService;
    } 
    
    @PostMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/execute")
    public ResponseEntity<ApiExecutionResponse> executeRequest(
            @PathVariable Long workspaceId,
            @PathVariable Long collectionId,
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                apiExecutionService.executeRequest(
                        workspaceId,
                        collectionId,
                        requestId
                )
        );
    }
}