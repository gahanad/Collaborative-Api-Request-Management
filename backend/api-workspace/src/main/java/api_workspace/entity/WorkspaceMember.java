package api_workspace.entity;

import api_workspace.enums.WorkspaceRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
@Entity
@Table(name = "workspace_members")
public class WorkspaceMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="workspace_id", nullable=false)
    @JsonIgnore
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkspaceRole role;

    private LocalDateTime joinedAt;

    public WorkspaceMember(){
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
