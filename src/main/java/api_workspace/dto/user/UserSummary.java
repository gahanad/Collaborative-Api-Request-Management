package api_workspace.dto.user;
// import api_workspace.enums.WorkspaceRole;
import api_workspace.entity.Collection;
import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSummary{
    private Long id;
    private String name;
    private String email;
}