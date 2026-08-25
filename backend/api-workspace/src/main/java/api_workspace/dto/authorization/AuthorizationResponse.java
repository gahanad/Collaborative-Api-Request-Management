package api_workspace.dto.authorization;

import api_workspace.enums.AuthType;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthorizationResponse {

    private Long id;

    private AuthType authType;

    private String bearerToken;

    private String username;

    private String password;

    private String apiKey;

    private String apiKeyName;

    private String apiKeyLocation;
}