package api_workspace.dto.collection;

import api_workspace.dto.user.UserSummary;
import api_workspace.dto.workspace.WorkspaceSummary;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class CollectionCreateRequest {

    @NotBlank(message = "Collection name is required")
    private String name;

    @Size(max = 500)
    private String description;
}