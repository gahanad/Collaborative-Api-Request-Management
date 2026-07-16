package api_workspace.repository;

import api_workspace.entity.Collection;
import api_workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollectionRepository
        extends JpaRepository<Collection, Long> {

    public List<Collection> findByWorkspace(Workspace workspace);
    // public Collection findById(Long ID);
}