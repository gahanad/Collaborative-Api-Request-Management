package api_workspace.dto.activity;

import api_workspace.enums.ActivityAction;
import api_workspace.enums.ResourceType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLogResponse {

    private Long id;

    private String userName;

    private ActivityAction action;

    private ResourceType resourceType;

    private String resourceName;

    private LocalDateTime createdAt;
}