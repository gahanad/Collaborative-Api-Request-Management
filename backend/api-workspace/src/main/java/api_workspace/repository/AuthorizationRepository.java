package api_workspace.repository;

import api_workspace.entity.ApiRequest;
import api_workspace.entity.Authorization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AuthorizationRepository
        extends JpaRepository<Authorization, Long> {

     Optional<Authorization> findByApiRequest(
            ApiRequest apiRequest
    );

}