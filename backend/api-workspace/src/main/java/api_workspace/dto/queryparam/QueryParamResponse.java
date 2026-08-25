package api_workspace.dto.queryparam;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QueryParamResponse {

    private Long id;

    private String paramKey;

    private String paramValue;

    private Boolean enabled;
}