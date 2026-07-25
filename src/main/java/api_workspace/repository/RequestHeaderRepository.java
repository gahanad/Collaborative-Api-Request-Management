package api_workspace.repository;

import api_workspace.entity.ApiRequest;
import api_workspace.entity.RequestHeader;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestHeaderRepository
        extends JpaRepository<RequestHeader,Long>{

    List<RequestHeader> findByApiRequest(ApiRequest apiRequest);
}