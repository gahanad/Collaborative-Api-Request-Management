package api_workspace.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineUserService {

    private final Map<Long, Set<String>> onlineUsers =
            new ConcurrentHashMap<>();

    public void userConnected(Long workspaceId,
                              String username) {

        onlineUsers
                .computeIfAbsent(
                        workspaceId,
                        k -> ConcurrentHashMap.newKeySet())
                .add(username);
    }

    public void userDisconnected(Long workspaceId,
                                 String username) {

        Set<String> users =
                onlineUsers.get(workspaceId);

        if(users != null){

            users.remove(username);

            if(users.isEmpty()){

                onlineUsers.remove(workspaceId);
            }
        }
    }

    public Set<String> getOnlineUsers(Long workspaceId){

        return onlineUsers.getOrDefault(
                workspaceId,
                Collections.emptySet()
        );
    }
}