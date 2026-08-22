// package api_workspace.controller;

// import api_workspace.service.*;
// import api_workspace.dto.execution.*;
// import api_workspace.dto.request.*;
// import api_workspace.entity.*;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;

// @RestController
// @RequestMapping("/workspaces")
// public class ApiExecutionController{
    
//     private final ApiExecutionService apiExecutionService;
//     public ApiExecutionController(ApiExecutionService apiExecutionService){
//         System.out.println("Execute endpoint hit");
//         this.apiExecutionService = apiExecutionService;
//     } 
    
//     @PostMapping("/{workspaceId}/collections/{collectionId}/requests/{requestId}/execute/{environmentId}")
//     public ResponseEntity<ApiExecutionResponse> executeRequest(
//             @PathVariable Long workspaceId,
//             @PathVariable Long collectionId,
//             @PathVariable Long requestId, 
//             @PathVariable Long environmentId) {

//         return ResponseEntity.ok(
//                 apiExecutionService.executeRequest(
//                         workspaceId,
//                         collectionId,
//                         requestId,
//                         environmentId
//                 )
//         );
//     }
// }

package api_workspace.Controller;

import api_workspace.dto.execution.ApiExecutionResponse;
import api_workspace.service.ApiExecutionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/workspaces")
public class ApiExecutionController {

    private final ApiExecutionService apiExecutionService;

    public ApiExecutionController(
            ApiExecutionService apiExecutionService) {

        this.apiExecutionService = apiExecutionService;
    }

    @PostMapping(
            "/{workspaceId}/collections/{collectionId}/requests/{requestId}/execute/{environmentId}"
    )
    public ResponseEntity<ApiExecutionResponse> executeRequest(

            @PathVariable Long workspaceId,

            @PathVariable Long collectionId,

            @PathVariable Long requestId,

            @PathVariable Long environmentId) {

        return ResponseEntity.ok(
                apiExecutionService.executeRequest(
                        workspaceId,
                        collectionId,
                        requestId,
                        environmentId
                )
        );
    }
}