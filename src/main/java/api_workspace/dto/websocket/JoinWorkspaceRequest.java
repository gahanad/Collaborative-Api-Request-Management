package api_workspace.dto.websocket;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinWorkspaceRequest {

    private Long workspaceId;

    private String username;
}