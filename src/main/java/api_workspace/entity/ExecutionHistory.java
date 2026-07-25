package api_workspace.entity;

import api_workspace.enums.HttpMethodType;
import api_workspace.entity.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private ApiRequest apiRequest;

    @ManyToOne
    @JoinColumn(name = "executed_by")
    private User executedBy;

    private Integer statusCode;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    private Long responseTime;

    private LocalDateTime executedAt;
}