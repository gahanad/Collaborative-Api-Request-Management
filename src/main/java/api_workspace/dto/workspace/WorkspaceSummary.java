package api_workspace.dto.workspace;
// import api_workspace.enums.WorkspaceRole;
import api_workspace.entity.Workspace;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkspaceSummary{
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}