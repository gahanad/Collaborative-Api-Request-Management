package api_workspace.dto.history;

import lombok.*;

import java.util.Map;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.http.HttpHeaders;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HistoryResponse {

    private Long id;

    private Integer statusCode;

    private Long responseTime;

    private LocalDateTime executedAt;

    private String responseBody;
}