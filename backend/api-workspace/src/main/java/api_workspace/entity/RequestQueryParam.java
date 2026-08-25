package api_workspace.entity;
import api_workspace.entity.ApiRequest;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "request_query_params")

public class RequestQueryParam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String paramKey;

    private String paramValue;

    private Boolean enabled = true;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private ApiRequest apiRequest;
}