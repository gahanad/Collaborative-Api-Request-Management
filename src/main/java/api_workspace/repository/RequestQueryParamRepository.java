package api_workspace.repository;

import api_workspace.entity.ApiRequest;
import api_workspace.entity.RequestQueryParam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestQueryParamRepository
        extends JpaRepository<RequestQueryParam, Long> {

    List<RequestQueryParam> findByApiRequest(ApiRequest apiRequest);
}