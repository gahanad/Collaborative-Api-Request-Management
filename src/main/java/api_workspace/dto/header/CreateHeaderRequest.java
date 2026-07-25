package api_workspace.dto.header;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateHeaderRequest {

    private String headerKey;

    private String headerValue;

    private Boolean enabled;
}