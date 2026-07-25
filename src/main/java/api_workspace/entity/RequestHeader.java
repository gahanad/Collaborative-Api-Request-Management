package api_workspace.entity;

import api_workspace.entity.ApiRequest;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String headerKey;

    private String headerValue;

    private Boolean enabled = true;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private ApiRequest apiRequest;
}