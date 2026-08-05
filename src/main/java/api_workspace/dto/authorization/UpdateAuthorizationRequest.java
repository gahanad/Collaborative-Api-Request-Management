package api_workspace.dto.authorization;

import api_workspace.enums.AuthType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAuthorizationRequest {

    private AuthType authType;

    private String bearerToken;

    private String username;

    private String password;

    private String apiKey;

    private String apiKeyName;

    private String apiKeyLocation;
}