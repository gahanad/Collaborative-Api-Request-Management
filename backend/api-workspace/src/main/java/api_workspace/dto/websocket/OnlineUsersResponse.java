package api_workspace.dto.websocket;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OnlineUsersResponse {

    private Long workspaceId;

    private Set<String> onlineUsers;
}