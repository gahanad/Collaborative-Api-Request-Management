package api_workspace.dto.collection;

import api_workspace.dto.user.UserSummary;
import api_workspace.dto.workspace.WorkspaceSummary;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CollectionSummaryResponse {

    private Long id;

    private String name;

    private String description;

    private LocalDateTime createdAt;

    private UserSummary createdBy;

    private WorkspaceSummary workspace;
}