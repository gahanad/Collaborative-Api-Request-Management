package api_workspace.repository;

import api_workspace.entity.Environment;
import api_workspace.entity.EnvironmentVariable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvironmentVariableRepository
        extends JpaRepository<EnvironmentVariable, Long> {

    List<EnvironmentVariable> findByEnvironment(Environment environment);

}