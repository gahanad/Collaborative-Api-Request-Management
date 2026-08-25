package api_workspace.dto.header;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeaderResponse {

    private Long id;

    private String headerKey;

    private String headerValue;

    private Boolean enabled;
}