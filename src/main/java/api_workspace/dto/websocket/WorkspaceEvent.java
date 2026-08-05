package api_workspace.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceEvent {

    private String action;

    private String resourceType;

    private String resourceName;

    private String username;

    private LocalDateTime timestamp;
}