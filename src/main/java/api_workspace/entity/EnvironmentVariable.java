package api_workspace.entity;

import api_workspace.entity.*;
import jakarta.persistence.*;
import lombok.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentVariable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String variableKey;

    @Column(columnDefinition = "TEXT")
    private String variableValue;

    @ManyToOne
    @JoinColumn(name = "environment_id")
    private Environment environment;
}