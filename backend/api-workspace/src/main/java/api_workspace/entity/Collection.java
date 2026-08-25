package api_workspace.entity;

import api_workspace.entity.WorkspaceMember;
import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import api_workspace.entity.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Entity
@Table(name = "collections")
public class Collection{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @CreatedDate // Automatically sets time
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
}