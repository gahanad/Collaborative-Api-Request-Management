package api_workspace.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionRegistryService {

    private final Map<String, Long> sessionWorkspace =
            new ConcurrentHashMap<>();

    private final Map<String, String> sessionUser =
            new ConcurrentHashMap<>();

    public void registerSession(
            String sessionId,
            Long workspaceId,
            String username){

        sessionWorkspace.put(sessionId, workspaceId);

        sessionUser.put(sessionId, username);
    }

    public Long getWorkspace(String sessionId){

        return sessionWorkspace.get(sessionId);
    }

    public String getUsername(String sessionId){

        return sessionUser.get(sessionId);
    }

    public void removeSession(String sessionId){

        sessionWorkspace.remove(sessionId);

        sessionUser.remove(sessionId);
    }
}