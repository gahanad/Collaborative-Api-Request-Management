package api_workspace.dto.queryparam;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateQueryParamRequest {

    private String paramKey;

    private String paramValue;

    private Boolean enabled;
}