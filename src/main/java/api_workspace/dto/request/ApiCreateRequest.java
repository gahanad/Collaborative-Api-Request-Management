package api_workspace.dto.request;

import api_workspace.enums.HttpMethodType;
import api_workspace.enums.AuthType;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Getter
@Setter
public class ApiCreateRequest {

    @NotBlank(message = "Request name is required")
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull(message = "HTTP method is required")
    private HttpMethodType method;

    @NotBlank(message = "URL is required")
    private String url;

    private String body;

    private AuthType authType;

    private String bearerToken;

    private String username;

    private String password;

    private String apiKeyName;

    private String apiKey;

    private String apiKeyLocation;
}