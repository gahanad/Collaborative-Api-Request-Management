package api_workspace.dto.request;

import api_workspace.enums.HttpMethodType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiCreateRequest {

    private String name;

    private String description;

    private HttpMethodType method;

    private String url;

    private String body;
}