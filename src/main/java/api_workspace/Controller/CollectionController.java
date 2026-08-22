package api_workspace.Controller;

import api_workspace.entity.Workspace;
import api_workspace.service.WorkspaceService;
import api_workspace.service.CollectionService;
import api_workspace.entity.Collection;
import api_workspace.dto.workspace.InviteRequest;
import api_workspace.dto.collection.CollectionCreateRequest;
import api_workspace.dto.collection.CollectionSummaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.util.List;


@RestController
@RequestMapping("/workspaces/collection")
public class CollectionController{
    private final CollectionService collectionService;
    public CollectionController(CollectionService collectionService){
        this.collectionService = collectionService;
    }

    // Creating a new collection
    @PostMapping("/{workspaceId}/createCollection")
    public ResponseEntity<Void> createCollection(
        @PathVariable Long workspaceId,
        @Valid 
        @RequestBody CollectionCreateRequest request) {

    collectionService.createCollection(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{workspaceId}/getAllcollections")
    public ResponseEntity<List<CollectionSummaryResponse>> getAllCollection(@PathVariable Long workspaceId) {

        return ResponseEntity.ok(collectionService.getAllCollection(workspaceId));
    }

    @DeleteMapping("/{collectionId}")
    public String deleteCollection(
            @PathVariable Long collectionId){

        collectionService.deleteCollection(collectionId);

        return "Collection deleted successfully";
    }

    @PutMapping("/{collectionId}")
    public ResponseEntity<String> updateCollection(
            @PathVariable Long collectionId,
            @Valid @RequestBody CollectionCreateRequest request
    ) {
        collectionService.updateCollection(collectionId, request);
        return ResponseEntity.ok("Collection updated successfully");
    }
}