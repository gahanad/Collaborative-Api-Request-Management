package api_workspace.dto.collectionRunner;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RunRequestResponse {

    private Long requestId;

    private String requestName;

    private Integer statusCode;

    private Long responseTime;

    private boolean success;
    
    private String errorMessage;
}