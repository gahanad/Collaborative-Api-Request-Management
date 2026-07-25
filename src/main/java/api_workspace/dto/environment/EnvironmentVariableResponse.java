package api_workspace.dto.environment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentVariableResponse {

    private Long id;

    private String variableKey;

    private String variableValue;
}