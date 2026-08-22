package api_workspace.dto.workspace;
import api_workspace.dto.user.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class WorkspaceSummary {

    private Long id;

    private String name;

    private String description;

    private LocalDateTime createdAt;

}