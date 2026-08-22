package api_workspace.dto.environment;

import api_workspace.entity.Workspace;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentResponse {

    private Long id;

    private String name;
    private Long workspaceId;
}