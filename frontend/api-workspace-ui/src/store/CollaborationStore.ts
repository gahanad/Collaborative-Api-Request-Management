import { create } from "zustand";

import {
    websocketService,
} from "../services/websocketService";

import type {
    CollaborationEvent,
    CollaboratorSnapshot,
} from "../types/collaboration";

// ==========================================
// Collaboration Store State
// ==========================================

interface CollaborationState {

    // ==========================================
    // Events
    // ==========================================

    events: CollaborationEvent[];

    // Latest received event
    latestEvent:
        CollaborationEvent | null;


    // ==========================================
    // Active Collaborators
    // ==========================================

    activeCollaborators:
        CollaboratorSnapshot[];


    // ==========================================
    // Connection
    // ==========================================

    connected: boolean;

    workspaceId:
        number | null;


    // ==========================================
    // Error
    // ==========================================

    error: string | null;


    // ==========================================
    // Actions
    // ==========================================

    connect: (
        workspaceId: number
    ) => void;

    disconnect: () => void;

    clearEvents: () => void;

    clearCollaborators: () => void;

    clearError: () => void;
}


// ==========================================
// Collaboration Store
// ==========================================

export const useCollaborationStore =
    create<CollaborationState>((set) => ({

        // ==========================================
        // Initial Events
        // ==========================================

        events: [],

        latestEvent: null,


        // ==========================================
        // Initial Collaborators
        // ==========================================

        activeCollaborators: [],


        // ==========================================
        // Initial Connection State
        // ==========================================

        connected: false,

        workspaceId: null,


        // ==========================================
        // Initial Error
        // ==========================================

        error: null,


        // ==========================================
        // Connect
        // ==========================================

        connect: (
            workspaceId
        ) => {

            // --------------------------------------
            // Clear previous workspace state
            // --------------------------------------

            set({
                workspaceId,
                error: null,
                activeCollaborators: [],
            });


            try {

                websocketService.connect(

                    workspaceId,


                    // ======================================
                    // 1. Event Received
                    // ======================================

                    (event) => {

                        set((state) => {


                            // ==========================================
                            // Collaborator Snapshot
                            // ==========================================

                            if (
                                event.type ===
                                "COLLABORATOR_SNAPSHOT"
                            ) {

                                return {

                                    events: [
                                        ...state.events,
                                        event,
                                    ],

                                    latestEvent:
                                        event,

                                    activeCollaborators:
                                        event.collaborators ?? [],

                                    error: null,
                                };
                            }


                            // ==========================================
                            // Collaborator Joined
                            // ==========================================

                            if (
                                event.type ===
                                "COLLABORATOR_JOINED"
                            ) {

                                return {

                                    events: [
                                        ...state.events,
                                        event,
                                    ],

                                    latestEvent:
                                        event,

                                    error: null,
                                };
                            }


                            // ==========================================
                            // Collaborator Left
                            // ==========================================

                            if (
                                event.type ===
                                "COLLABORATOR_LEFT"
                            ) {

                                return {

                                    events: [
                                        ...state.events,
                                        event,
                                    ],

                                    latestEvent:
                                        event,

                                    error: null,
                                };
                            }


                            // ==========================================
                            // Normal Collaboration Event
                            // ==========================================

                            return {

                                events: [
                                    ...state.events,
                                    event,
                                ],

                                latestEvent:
                                    event,

                                error: null,
                            };

                        });
                    },


                    // ======================================
                    // 2. Connected
                    // ======================================

                    () => {

                        set({

                            connected: true,

                            error: null,

                        });
                    },


                    // ======================================
                    // 3. Disconnected
                    // ======================================

                    () => {

                        set({

                            connected: false,
                            activeCollaborators: [],
                        });
                    },


                    // ======================================
                    // 4. Error
                    // ======================================

                    (error) => {

                        console.error(
                            "❌ Collaboration WebSocket error:",
                            error
                        );


                        set({

                            connected: false,

                            error,

                        });
                    }

                );

            } catch (error: any) {

                console.error(
                    "❌ Failed to connect WebSocket:",
                    error
                );


                set({

                    connected: false,

                    error:
                        error?.message ||
                        "Failed to connect WebSocket",

                });
            }
        },


        // ==========================================
        // Disconnect
        // ==========================================

        disconnect: () => {

            websocketService.disconnect();

            set({
                connected: false,
                workspaceId: null,
                activeCollaborators: [],
                latestEvent: null,
                events: [],
                error: null,
            });
        },


        // ==========================================
        // Clear Events
        // ==========================================

        clearEvents: () => {

            set({

                events: [],

                latestEvent: null,

            });
        },


        // ==========================================
        // Clear Collaborators
        // ==========================================

        clearCollaborators: () => {

            set({

                activeCollaborators: [],

            });
        },


        // ==========================================
        // Clear Error
        // ==========================================

        clearError: () => {

            set({

                error: null,

            });
        },

    }));