package api_workspace.dto.workspace;
import api_workspace.enums.WorkspaceRole;
import api_workspace.entity.WorkspaceMember;
import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteRequest{
    private String email;
    private WorkspaceRole role;
    public InviteRequest(){}
    public String getEmail(){
        return email;
    }
    public WorkspaceRole getRole(){
        return role;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public void setRole(WorkspaceRole role){
        this.role = role;
    }
}