package api_workspace.entity;

import api_workspace.entity.*;
import api_workspace.enums.AuthType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "request_authorizations")
public class Authorization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AuthType authType;

    // Bearer Token
    @Column(columnDefinition = "TEXT")
    private String bearerToken;

    // Basic Auth
    private String username;

    @Column(columnDefinition = "TEXT")
    private String password;

    // API Key
    private String apiKey;

    private String apiKeyName;

    // HEADER or QUERY
    private String apiKeyLocation;

    @OneToOne
    @JoinColumn(name = "request_id")
    private ApiRequest apiRequest;
}