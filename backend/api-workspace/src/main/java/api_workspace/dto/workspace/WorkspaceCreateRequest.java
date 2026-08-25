package api_workspace.dto.workspace;
import api_workspace.enums.WorkspaceRole;
import api_workspace.entity.WorkspaceMember;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;
import jakarta.validation.constraints.*;

@Getter
@Setter
public class WorkspaceCreateRequest {

    @NotBlank(message = "Workspace name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;
}