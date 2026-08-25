package api_workspace.dto.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class ValidationErrorResponse {

    private int status;

    private String message;

    private Map<String,String> errors;

    private LocalDateTime timestamp;
}