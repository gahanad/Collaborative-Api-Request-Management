package api_workspace.repository;

import api_workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface WorkspaceRepository extends JpaRepository<Workspace, Long>{
    public Workspace findByName(String name);
    // public Workspace findById(Long ID);
    public List<Workspace> findAll();
    // public Workspace findById(Long ID);
}