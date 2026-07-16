package api_workspace.repository;

import api_workspace.entity.ApiRequest;
import api_workspace.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApiRequestRepository extends JpaRepository<ApiRequest, Long> {

    List<ApiRequest> findByCollection(Collection collection);

}