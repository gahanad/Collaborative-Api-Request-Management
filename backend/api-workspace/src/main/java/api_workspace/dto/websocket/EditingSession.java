package api_workspace.dto.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EditingSession {

    private Long workspaceId;

    private Long requestId;

    private String requestName;

    private String username;
}