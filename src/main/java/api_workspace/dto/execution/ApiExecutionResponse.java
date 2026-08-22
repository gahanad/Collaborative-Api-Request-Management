package api_workspace.dto.execution;

import lombok.*;

import java.util.Map;
import java.util.List;
import org.springframework.http.HttpHeaders;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiExecutionResponse {
    private int statusCode;
    private String body;
    private HttpHeaders headers;
    private long responseTime;
    private long size;
}