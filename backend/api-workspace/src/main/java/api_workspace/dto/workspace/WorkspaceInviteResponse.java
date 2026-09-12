package api_workspace.dto.workspace;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class WorkspaceInviteResponse {
    private Long id;
    private String workspaceName;
    private String invitedByName;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}