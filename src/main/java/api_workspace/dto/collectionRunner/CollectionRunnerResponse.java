package api_workspace.dto.collectionRunner;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CollectionRunnerResponse {

    private String collectionName;

    private Integer totalRequests;

    private Integer successfulRequests;

    private Integer failedRequests;

    private List<RunRequestResponse> results;
}