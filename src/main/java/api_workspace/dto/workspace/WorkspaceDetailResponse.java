package api_workspace.dto.workspace;
import api_workspace.enums.WorkspaceRole;
import api_workspace.entity.WorkspaceMember;
import api_workspace.dto.collection.*;
import api_workspace.dto.user.*;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;


@Getter
@Setter
public class WorkspaceDetailResponse {

    private Long id;

    private String name;

    private String description;

    private LocalDateTime createdAt;

    private UserSummary createdBy;

    private List<CollectionSummaryResponse> collections;

}