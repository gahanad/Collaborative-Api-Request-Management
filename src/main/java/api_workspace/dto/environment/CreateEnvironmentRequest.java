package api_workspace.dto.environment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Getter
@Setter
public class CreateEnvironmentRequest {

    @NotBlank(message = "Environment name is required")
    private String name;

}