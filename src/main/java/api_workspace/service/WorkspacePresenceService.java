package api_workspace.service;

import api_workspace.entity.User;
import api_workspace.entity.Workspace;
import api_workspace.entity.WorkspaceMember;

import api_workspace.repository.WorkspaceMemberRepository;
import api_workspace.repository.WorkspaceRepository;

import org.springframework.beans.factory.ObjectProvider;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class WorkspacePresenceService {


    private final ObjectProvider<SimpMessagingTemplate>
            messagingTemplateProvider;


    private final WorkspaceRepository
            workspaceRepository;


    private final WorkspaceMemberRepository
            workspaceMemberRepository;


    // ==========================================
    // workspaceId -> active user IDs
    // ==========================================

    private final Map<Long, Set<Long>>
            workspaceUsers =
            new ConcurrentHashMap<>();


    // ==========================================
    // STOMP session -> workspace
    // ==========================================

    private final Map<String, Long>
            sessionWorkspaces =
            new ConcurrentHashMap<>();


    // ==========================================
    // STOMP session -> user
    // ==========================================

    private final Map<String, User>
            sessionUsers =
            new ConcurrentHashMap<>();

    public void publishCollaboratorSnapshot(
        Long workspaceId) {

         System.out.println("==========================================");
    System.out.println("🔥 PUBLISHING PRESENCE SNAPSHOT");
    System.out.println("Workspace ID: " + workspaceId);

    System.out.println(
        "workspaceUsers = " + workspaceUsers
    );

    System.out.println(
        "sessionWorkspaces = " + sessionWorkspaces
    );

    System.out.println(
        "sessionUsers = " + sessionUsers
    );

    Set<Long> userIds =
            workspaceUsers.get(workspaceId);

    System.out.println(
        "User IDs for workspace " +
        workspaceId +
        " = " +
        userIds
    );

        


        java.util.List<Map<String, Object>>
                collaborators =
                new java.util.ArrayList<>();


        if (userIds != null) {

            for (Long userId : userIds) {

                User activeUser = null;


                for (
                    Map.Entry<String, User> entry :
                    sessionUsers.entrySet()
                ) {

                    String sessionId =
                            entry.getKey();

                    User user =
                            entry.getValue();


                    Long sessionWorkspace =
                            sessionWorkspaces.get(
                                    sessionId
                            );


                    if (
                        sessionWorkspace != null &&
                        sessionWorkspace.equals(
                                workspaceId
                        ) &&
                        user.getId().equals(
                                userId
                        )
                    ) {

                        activeUser = user;

                        break;
                    }
                }


                if (activeUser != null) {

                    collaborators.add(
                            Map.of(
                                    "userId",
                                    activeUser.getId(),

                                    "userName",
                                    activeUser.getName()
                            )
                    );
                }
            }
        }


        Map<String, Object> snapshot =
                Map.of(
                        "type",
                        "COLLABORATOR_SNAPSHOT",

                        "workspaceId",
                        workspaceId,

                        "collaborators",
                        collaborators
                );


        System.out.println(
                "Broadcasting presence snapshot: "
                        + snapshot
        );


        messagingTemplateProvider
                .getObject()
                .convertAndSend(
                        "/topic/workspaces/"
                                + workspaceId,
                        (Object) snapshot
                );
    }


    public WorkspacePresenceService(

            ObjectProvider<SimpMessagingTemplate>
                    messagingTemplateProvider,

            WorkspaceRepository
                    workspaceRepository,

            WorkspaceMemberRepository
                    workspaceMemberRepository) {


        this.messagingTemplateProvider =
                messagingTemplateProvider;


        this.workspaceRepository =
                workspaceRepository;


        this.workspaceMemberRepository =
                workspaceMemberRepository;
    }


    // ==========================================
    // User Joined Workspace
    // ==========================================

    public void userJoined(

            String sessionId,

            Long workspaceId,

            User user) {


        Workspace workspace =
                workspaceRepository
                        .findById(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workspace not found"
                                )
                        );


        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                user
                        );


        if (member == null) {

            throw new RuntimeException(
                    "User is not a workspace member"
            );
        }


        sessionWorkspaces.put(
                sessionId,
                workspaceId
        );


        sessionUsers.put(
                sessionId,
                user
        );


        Set<Long> users =
                workspaceUsers.computeIfAbsent(
                        workspaceId,
                        key ->
                                ConcurrentHashMap
                                        .newKeySet()
                );


        boolean added =
                users.add(
                        user.getId()
                );


        if (!added) {

            return;
        }


        // publishPresenceEvent(
        //         workspaceId,
        //         user,
        //         "COLLABORATOR_JOINED"
        // );

        publishCollaboratorSnapshot(
            workspaceId
        );
    }


    // ==========================================
    // User Left Workspace
    // ==========================================

    public void userLeft(
            String sessionId) {

        // ==========================================
        // Find workspace before removing session
        // ==========================================

        Long workspaceId =
                sessionWorkspaces.remove(
                        sessionId
                );


        // ==========================================
        // Find user before removing session
        // ==========================================

        User user =
                sessionUsers.remove(
                        sessionId
                );


        // ==========================================
        // Nothing to clean
        // ==========================================

        if (
                workspaceId == null ||
                user == null
        ) {

            return;
        }


        System.out.println(
                "[WS] Session disconnected"
                + " | session="
                + sessionId
                + " | user="
                + user.getId()
                + " | workspace="
                + workspaceId
        );


        // ==========================================
        // Check if same user still has another
        // active WebSocket session
        // ==========================================

        boolean userStillConnected =
                sessionUsers.entrySet()
                        .stream()
                        .anyMatch(entry -> {

                            String otherSessionId =
                                    entry.getKey();

                            User otherUser =
                                    entry.getValue();


                            if (
                                    !otherUser
                                            .getId()
                                            .equals(
                                                    user.getId()
                                            )
                            ) {

                                return false;
                            }


                            Long otherWorkspace =
                                    sessionWorkspaces.get(
                                            otherSessionId
                                    );


                            return workspaceId.equals(
                                    otherWorkspace
                            );
                        });


        // ==========================================
        // User still has another tab/session
        // ==========================================

        if (userStillConnected) {

            System.out.println(
                    "[WS] User still has another"
                    + " active session"
            );

            return;
        }


        // ==========================================
        // User has completely left workspace
        // ==========================================

        Set<Long> users =
                workspaceUsers.get(
                        workspaceId
                );


        if (users == null) {

            return;
        }


        boolean removed =
                users.remove(
                        user.getId()
                );


        if (!removed) {

            return;
        }


        System.out.println(
                "[WS] User completely left workspace"
                + " | user="
                + user.getName()
                + " | workspace="
                + workspaceId
        );


        // ==========================================
        // Broadcast updated snapshot
        // ==========================================

        publishCollaboratorSnapshot(
                workspaceId
        );


        // ==========================================
        // Remove empty workspace entry
        // ==========================================

        if (users.isEmpty()) {

            workspaceUsers.remove(
                    workspaceId
            );
        }
    }


    // ==========================================
    // Publish Presence Event
    // ==========================================

    // private void publishPresenceEvent(

    //         Long workspaceId,

    //         User user,

    //         String eventType) {


    //     Map<String, Object> event =
    //             Map.of(

    //                     "type",
    //                     eventType,

    //                     "workspaceId",
    //                     workspaceId,

    //                     "userId",
    //                     user.getId(),

    //                     "userName",
    //                     user.getName()
    //             );


    //     messagingTemplateProvider
    //             .getObject()
    //             .convertAndSend(

    //                     "/topic/workspaces/"
    //                             + workspaceId,

    //                     (Object) event
    //             );
    // }

    // ==========================================
    // Handle STOMP Session Disconnect
    // ==========================================

    public void handleDisconnect(
            String sessionId) {

        System.out.println(
                "[WS] Handling disconnected session: "
                + sessionId
        );

        userLeft(sessionId);
    }

}