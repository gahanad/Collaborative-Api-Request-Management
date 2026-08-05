package api_workspace.dto.environment;

import lombok.*;
import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateEnvironmentVariableRequest {

    @NotBlank(message = "Variable key is required")
    private String variableKey;

    @NotBlank(message = "Variable value is required")
    private String variableValue;
}