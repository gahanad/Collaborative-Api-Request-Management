package api_workspace.repository;

import api_workspace.entity.Environment;
import api_workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvironmentRepository extends JpaRepository<Environment, Long> {

    List<Environment> findByWorkspace(Workspace workspace);

}