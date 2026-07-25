package api_workspace.repository;

import api_workspace.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionHistoryRepository
        extends JpaRepository<ExecutionHistory, Long> {

    List<ExecutionHistory> findByApiRequestOrderByExecutedAtDesc(
            ApiRequest apiRequest);
}