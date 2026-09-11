import {
    Client,
    type IMessage,
    type StompSubscription,
} from "@stomp/stompjs";

import SockJS from "sockjs-client/dist/sockjs.js";

import type {
    CollaborationEvent,
} from "../types/collaboration";


// ==========================================
// Callback Types
// ==========================================

type EventCallback =
    (event: CollaborationEvent) => void;

type ConnectedCallback =
    () => void;

type DisconnectedCallback =
    () => void;

type ErrorCallback =
    (error: string) => void;


// ==========================================
// WebSocket Service
// ==========================================

class WebSocketService {

    // ==========================================
    // STOMP Client
    // ==========================================

    private client:
        Client | null = null;


    // ==========================================
    // Current Subscription
    // ==========================================

    private subscription:
        StompSubscription | null = null;


    // ==========================================
    // Current Workspace
    // ==========================================

    private workspaceId:
        number | null = null;


    // ==========================================
    // Callbacks
    // ==========================================

    private onEvent:
        EventCallback | null = null;

    private onConnected:
        ConnectedCallback | null = null;

    private onDisconnected:
        DisconnectedCallback | null = null;

    private onError:
        ErrorCallback | null = null;


    // ==========================================
    // Intentional Disconnect
    // ==========================================

    private intentionalDisconnect =
        false;


    // ==========================================
    // Connect
    // ==========================================

    connect(
        workspaceId: number,
        onEvent: EventCallback,
        onConnected: ConnectedCallback,
        onDisconnected: DisconnectedCallback,
        onError: ErrorCallback
    ): void {

        // ==========================================
        // Prevent duplicate connections
        // ==========================================

        if (
            this.client &&
            (
                this.client.active ||
                this.client.connected
            )
        ) {

            console.log(
                "[STOMP] Already connected/connecting"
            );

            return;
        }


        // ==========================================
        // Save workspace + callbacks
        // ==========================================

        this.workspaceId =
            workspaceId;

        this.onEvent =
            onEvent;

        this.onConnected =
            onConnected;

        this.onDisconnected =
            onDisconnected;

        this.onError =
            onError;

        this.intentionalDisconnect =
            false;


        // ==========================================
        // Get JWT
        // ==========================================

        const token =
            localStorage.getItem("token");


        if (!token) {

            const message =
                "Authentication token not found";

            console.error(
                "[STOMP]",
                message
            );

            this.onError?.(
                message
            );

            return;
        }


        // ==========================================
        // Create STOMP Client
        // ==========================================

        const client =
            new Client({

                // ==========================================
                // SockJS connection
                // ==========================================

                webSocketFactory: () =>
                    new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`),


                // ==========================================
                // Automatic Reconnection
                // ==========================================

                reconnectDelay: 5000,


                // ==========================================
                // Heartbeats
                // ==========================================

                heartbeatIncoming: 10000,

                heartbeatOutgoing: 10000,


                // ==========================================
                // Connection Timeout
                // ==========================================

                connectionTimeout: 10000,


                // ==========================================
                // STOMP CONNECT headers
                // ==========================================

                connectHeaders: {

                    Authorization:
                        `Bearer ${token}`,

                },

            });


        this.client =
            client;


        // ==========================================
        // Successful Connection
        // ==========================================

        client.onConnect = () => {

            console.log(
                "[STOMP] Connected to server"
            );


            if (
                this.workspaceId === null
            ) {
                return;
            }


            // ==========================================
            // Remove old subscription
            // ==========================================

            if (
                this.subscription
            ) {

                this.subscription.unsubscribe();

                this.subscription =
                    null;
            }


            // ==========================================
            // Subscribe to workspace
            // ==========================================

            const destination =
                `/topic/workspaces/${this.workspaceId}`;


            console.log(
                "[STOMP] Subscribing to:",
                destination
            );


            this.subscription =
                client.subscribe(
                    destination,
                    (
                        message: IMessage
                    ) => {

                        console.log(
                            "[STOMP] Received data",
                            message
                        );


                        try {

                            const event =
                                JSON.parse(
                                    message.body
                                ) as CollaborationEvent;


                            console.log(
                                "🔥 WS EVENT RECEIVED",
                                event
                            );


                            console.log(
                                "Collaboration event:",
                                event
                            );


                            // ==========================================
                            // Send event to Zustand
                            // ==========================================

                            this.onEvent?.(
                                event
                            );

                        } catch (error) {

                            console.error(
                                "[STOMP] Failed to parse message:",
                                error
                            );


                            this.onError?.(
                                "Failed to process WebSocket message"
                            );
                        }
                    }
                );


            console.log(
                "[STOMP] Workspace subscription active"
            );


            // ==========================================
            // Tell Zustand we're connected
            // ==========================================

            this.onConnected?.();
        };


        // ==========================================
        // STOMP Broker Error
        // ==========================================

        client.onStompError = (
            frame
        ) => {

            console.error(
                "[STOMP] Broker error:",
                frame
            );


            const message =
                frame.headers[
                    "message"
                ] ||
                frame.body ||
                "STOMP broker error";


            this.onError?.(
                message
            );
        };


        // ==========================================
        // WebSocket Error
        // ==========================================

        client.onWebSocketError = (
            error
        ) => {

            console.error(
                "[WebSocket] Connection error:",
                error
            );


            this.onError?.(
                "WebSocket connection error"
            );
        };


        // ==========================================
        // WebSocket Closed
        // ==========================================

        client.onWebSocketClose = (
            event
        ) => {

            console.warn(
                "[WebSocket] Connection closed:",
                event
            );


            this.subscription =
                null;


            this.onDisconnected?.();


            // ==========================================
            // Automatic reconnection is handled
            // by STOMP's reconnectDelay.
            // ==========================================

            if (
                !this.intentionalDisconnect
            ) {

                console.log(
                    "[STOMP] Reconnection will be attempted automatically"
                );
            }
        };


        // ==========================================
        // STOMP Disconnect
        // ==========================================

        client.onDisconnect = () => {

            console.log(
                "[STOMP] Disconnected"
            );


            this.subscription =
                null;

        };


        // ==========================================
        // Activate Client
        // ==========================================

        console.log(
            "[STOMP] Activating client..."
        );


        client.activate();
    }


    // ==========================================
    // Disconnect
    // ==========================================

    disconnect(): void {

        console.log(
            "[STOMP] Intentional disconnect"
        );


        this.intentionalDisconnect =
            true;


        // ==========================================
        // Remove subscription
        // ==========================================

        if (
            this.subscription
        ) {

            this.subscription.unsubscribe();

            this.subscription =
                null;
        }


        // ==========================================
        // Deactivate STOMP
        // ==========================================

        if (
            this.client
        ) {

            this.client.deactivate();

            this.client =
                null;
        }


        // ==========================================
        // Clear workspace
        // ==========================================

        this.workspaceId =
            null;

        this.onEvent =
            null;

        this.onConnected =
            null;

        this.onDisconnected =
            null;

        this.onError =
            null;
    }


    // ==========================================
    // Connection Status
    // ==========================================

    isConnected(): boolean {

        return (
            this.client?.connected ===
            true
        );
    }
}


// ==========================================
// Export Singleton
// ==========================================

export const websocketService =
    new WebSocketService();