package api_workspace.service;

import api_workspace.dto.websocket.EditingSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EditingSessionService {

    private final Map<Long, EditingSession> editingRequests =
            new ConcurrentHashMap<>();

    public synchronized boolean acquireLock(EditingSession session) {
        if (editingRequests.containsKey(session.getRequestId())) {
            return false;
        }
        editingRequests.put(session.getRequestId(), session);
        return true;
    }

    public synchronized void releaseLock(Long requestId) {
        editingRequests.remove(requestId);
    }

    public boolean isLocked(Long requestId) {
        return editingRequests.containsKey(requestId);
    }

    public String getLockOwner(Long requestId) {
        EditingSession session = editingRequests.get(requestId);
        return session == null ? null : session.getUsername();
    }

    public EditingSession getEditingSession(Long requestId) {
        return editingRequests.get(requestId);
    }

    public synchronized EditingSession removeUserEditing(String username) {
        for (Map.Entry<Long, EditingSession> entry : editingRequests.entrySet()) {
            if (entry.getValue().getUsername().equals(username)) {
                editingRequests.remove(entry.getKey());
                return entry.getValue();
            }
        }
        return null;
    }
}