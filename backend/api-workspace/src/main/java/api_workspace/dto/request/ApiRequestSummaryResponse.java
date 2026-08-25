package api_workspace.dto.request;

import api_workspace.dto.collection.CollectionSummaryResponse;
import api_workspace.dto.user.UserSummary;
import api_workspace.dto.authorization.*;

import api_workspace.enums.HttpMethodType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ApiRequestSummaryResponse {

    private Long id;

    private String name;

    private String description;

    private HttpMethodType method;

    private String url;

    private String body;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private UserSummary createdBy;

    private CollectionSummaryResponse collection;

    private AuthorizationResponse authorization;
}