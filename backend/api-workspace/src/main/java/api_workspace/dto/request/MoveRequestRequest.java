package api_workspace.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveRequestRequest {

    @NotNull(message = "Target collection is required")
    private Long targetCollectionId;
}