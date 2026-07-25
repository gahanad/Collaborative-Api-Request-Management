package api_workspace.dto.environment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateEnvironmentVariableRequest {

    private String variableKey;

    private String variableValue;
}