import { create } from "zustand";

import type {
    RequestSummary,
    RequestDetail,
    CreateRequestRequest,
    UpdateRequestRequest,
} from "../types/request";

import { requestService } from "../services/requestService";
import {
    getApiErrorMessage,
} from "../utils/apiError";


interface RequestStore {

    // --------------------------------
    // State
    // --------------------------------

    requests: RequestSummary[];

    selectedRequest: RequestDetail | null;

    loading: boolean;

    saving: boolean;

    error: string | null;

    hasUnsavedChanges: boolean;


    // --------------------------------
    // Request List
    // --------------------------------

    fetchRequests: (
        workspaceId: number,
        collectionId: number
    ) => Promise<void>;


    // --------------------------------
    // Single Request
    // --------------------------------

    fetchRequestById: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<void>;


    // --------------------------------
    // CRUD
    // --------------------------------

    createRequest: (
        workspaceId: number,
        collectionId: number,
        request: CreateRequestRequest
    ) => Promise<RequestSummary | null>;


    updateRequest: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        request: UpdateRequestRequest
    ) => Promise<RequestSummary | null>;


    saveRequest: (
        workspaceId: number,
        collectionId: number
    ) => Promise<void>;


    deleteRequest: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<void>;


    duplicateRequest: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<RequestSummary | null>;


    // --------------------------------
    // Selection
    // --------------------------------

    selectRequest: (
        request: RequestDetail | null
    ) => void;


    // --------------------------------
    // Editor Draft
    // --------------------------------

    updateRequestDraft: (
        updates: Partial<RequestDetail>
    ) => void;


    // --------------------------------
    // Dirty State
    // --------------------------------

    markDirty: () => void;

    markClean: () => void;


    // --------------------------------
    // Cleanup
    // --------------------------------

    clearRequests: () => void;

    moveRequest: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        targetCollectionId: number
    ) => Promise<RequestSummary | null>;
}

function updateRequestInState(
    requests: RequestSummary[],
    selectedRequest: RequestDetail | null,
    updatedRequest: RequestSummary
) {

    const updatedRequests =
        requests.map((request) =>
            request.id === updatedRequest.id
                ? updatedRequest
                : request
        );


    const updatedSelectedRequest =
        selectedRequest?.id === updatedRequest.id
            ? {
                ...selectedRequest,
                ...updatedRequest,
            }
            : selectedRequest;


    return {
        requests: updatedRequests,
        selectedRequest: updatedSelectedRequest,
    };
}

export const useRequestStore =
    create<RequestStore>((set, get) => ({

        // ==================================
        // Initial State
        // ==================================

        requests: [],

        selectedRequest: null,

        loading: false,

        saving: false,

        error: null,

        hasUnsavedChanges: false,


        // ==================================
        // Fetch All Requests
        // ==================================

        fetchRequests: async (
            workspaceId,
            collectionId
        ) => {

            set({
                loading: true,
                error: null,
            });


            try {

                const requests =
                    await requestService.getAllRequests(
                        workspaceId,
                        collectionId
                    );


                set({
                    requests,
                    loading: false,
                });


            } catch (error) {

                console.error(
                    "Failed to fetch requests:",
                    error
                );


                set({
                    requests: [],
                    loading: false,
                    error: "Failed to load requests.",
                });

            }

        },


        // ==================================
        // Fetch Single Request
        // ==================================

        fetchRequestById: async (
            workspaceId,
            collectionId,
            requestId
        ) => {

            set({
                loading: true,
                error: null,
            });


            try {

                const request =
                    await requestService.getRequestById(
                        workspaceId,
                        collectionId,
                        requestId
                    );


                set({

                    selectedRequest: {
                        ...request,

                        /*
                         * Headers and query params are
                         * loaded separately.
                         *
                         * They are initialized here so
                         * the editor always has arrays.
                         */
                        headers: [],

                        queryParams: [],
                    },

                    loading: false,

                    hasUnsavedChanges: false,

                });


            } catch (error) {

                console.error(
                    "Failed to fetch request:",
                    error
                );


                set({

                    selectedRequest: null,

                    loading: false,

                    error: "Failed to load request.",

                });

            }

        },


        // ==================================
        // Create Request
        // ==================================

        createRequest: async (
            workspaceId,
            collectionId,
            request
        ) => {

            set({
                loading: true,
                error: null,
            });

            try {

                // ==========================================
                // 1. Create request on backend
                // ==========================================

                const createdRequest =
                    await requestService.createRequest(
                        workspaceId,
                        collectionId,
                        request
                    );


                // ==========================================
                // 2. Add request to sidebar list
                // ==========================================

                set((state) => ({
                    requests: [
                        ...state.requests,
                        createdRequest,
                    ],
                }));


                // ==========================================
                // 3. Fetch complete request
                // ==========================================

                await get().fetchRequestById(
                    workspaceId,
                    collectionId,
                    createdRequest.id
                );


                // ==========================================
                // 4. Finish loading
                // ==========================================

                set({
                    loading: false,
                    error: null,
                });


                return createdRequest;

            } catch (error) {

                console.error(
                    "Failed to create request:",
                    error
                );

                set({
                    loading: false,
                    error: "Failed to create request.",
                });

                return null;
            }
        },


        // ==================================
        // Update Request
        // ==================================

        updateRequest: async (
            workspaceId,
            collectionId,
            requestId,
            request
        ) => {

            /*
             * This is an actual PUT operation.
             *
             * Use `saving`, not `loading`, because
             * the user is saving editor changes.
             */

            set({

                saving: true,

                error: null,

            });


            try {

                const updatedRequest =
                    await requestService.updateRequest(
                        workspaceId,
                        collectionId,
                        requestId,
                        request
                    );



                    set((state) => {

                const synced =
                    updateRequestInState(
                        state.requests,
                        state.selectedRequest,
                        updatedRequest
                    );

                return {

                    ...synced,

                    hasUnsavedChanges: false,

                    saving: false,

                    loading: false,

                    error: null,

                };
            });
            return updatedRequest;

            } catch (error) {

                console.error(
                    "Failed to update request:",
                    error
                );


                set({

                    saving: false,

                    error:
                    getApiErrorMessage(
                        error,
                        "Failed to update request."
                    ),

                });


                return null;

            }

        },


        // ==================================
        // Save Current Editor Request
        // ==================================

        saveRequest: async (
            workspaceId,
            collectionId
        ) => {

            /*
             * Get the current editor state.
             */

            const request =
                get().selectedRequest;


            if (!request) {

                throw new Error(
                    "No request selected."
                );

            }


            /*
             * Backend requires a request name.
             */

            if (!request.name.trim()) {

                throw new Error(
                    "Request name is required."
                );

            }


            /*
             * Backend requires a URL.
             */

            if (!request.url.trim()) {

                throw new Error(
                    "Request URL is required."
                );

            }


            /*
             * Authorization is stored as a nested
             * object in the frontend.
             *
             * Backend ApiCreateRequest /
             * UpdateRequestRequest expects
             * these fields at the top level.
             */

            const authorization =
                request.authorization;


            const payload:
                UpdateRequestRequest = {

                name:
                    request.name.trim(),

                description:
                    request.description ??
                    null,

                method:
                    request.method,

                url:
                    request.url.trim(),

                body:
                    request.body ??
                    null,

                authType:
                    authorization?.authType ??
                    "NONE",

                bearerToken:
                    authorization?.bearerToken ??
                    null,

                username:
                    authorization?.username ??
                    null,

                password:
                    authorization?.password ??
                    null,

                apiKeyName:
                    authorization?.apiKeyName ??
                    null,

                apiKey:
                    authorization?.apiKey ??
                    null,

                apiKeyLocation:
                    authorization?.apiKeyLocation ??
                    null,

            };


            /*
             * Use the existing updateRequest()
             * method instead of duplicating the
             * PUT API logic here.
             */

            const updatedRequest =
                await get().updateRequest(
                    workspaceId,
                    collectionId,
                    request.id,
                    payload
                );


            /*
             * updateRequest() returns null when
             * the API request fails.
             */

            if (!updatedRequest) {

                throw new Error(
                    "Failed to save request."
                );

            }

        },


        // ==================================
        // Delete Request
        // ==================================

        deleteRequest: async (
            workspaceId,
            collectionId,
            requestId
        ) => {

            set({

                loading: true,

                error: null,

            });


            try {

                await requestService.deleteRequest(
                    workspaceId,
                    collectionId,
                    requestId
                );


                set((state) => {

                    const isSelected =
                        state.selectedRequest?.id === requestId;

                    return {

                        requests:
                            state.requests.filter(
                                (request) =>
                                    request.id !== requestId
                            ),

                        selectedRequest:
                            isSelected
                                ? null
                                : state.selectedRequest,

                        hasUnsavedChanges:
                            isSelected
                                ? false
                                : state.hasUnsavedChanges,

                        loading: false,

                        error: null,

                    };
                });

            } catch (error) {

                console.error(
                    "Failed to delete request:",
                    error
                );


                set({

                    loading: false,

                    error:
                    getApiErrorMessage(
                        error,
                        "Failed to delete request."
                    ),

                });

            }

        },


        // ==================================
        // Duplicate Request
        // ==================================

        duplicateRequest: async (
            workspaceId,
            collectionId,
            requestId
        ) => {

            set({
                loading: true,
                error: null,
            });


            try {

                // ==========================================
                // 1. Duplicate on backend
                // ==========================================

                const duplicatedRequest =
                    await requestService.duplicateRequest(
                        workspaceId,
                        collectionId,
                        requestId
                    );


                // ==========================================
                // 2. Add duplicate to request list
                // ==========================================

                set((state) => ({
                    requests: [
                        ...state.requests,
                        duplicatedRequest,
                    ],
                }));


                // ==========================================
                // 3. Fetch complete duplicated request
                // ==========================================

                await get().fetchRequestById(
                    workspaceId,
                    collectionId,
                    duplicatedRequest.id
                );


                // ==========================================
                // 4. Finish
                // ==========================================

                set({
                    loading: false,
                    error: null,
                });


                return duplicatedRequest;

            } catch (error) {

                console.error(
                    "Failed to duplicate request:",
                    error
                );


                set({
                    loading: false,
                    error:
                    getApiErrorMessage(
                        error,
                        "Failed to duplicate request."
                    ),

                });


                return null;
            }
        },


        // ==================================
        // Select Request
        // ==================================

        selectRequest: (request) => {

            set({

                selectedRequest: request,

                hasUnsavedChanges: false,

                error: null,

            });

        },


        // ==================================
        // Update Local Editor Draft
        // ==================================

        updateRequestDraft: (updates) => {

            set((state) => {

                if (!state.selectedRequest) {

                    return state;

                }


                return {

                    selectedRequest: {

                        ...state.selectedRequest,

                        ...updates,

                    },

                    hasUnsavedChanges: true,

                };

            });

        },


        // ==================================
        // Mark Dirty
        // ==================================

        markDirty: () => {

            set({

                hasUnsavedChanges: true,

            });

        },


        // ==================================
        // Mark Clean
        // ==================================

        markClean: () => {

            set({

                hasUnsavedChanges: false,

            });

        },


        // ==================================
        // Clear Store
        // ==================================

        clearRequests: () => {

            set({

                requests: [],

                selectedRequest: null,

                loading: false,

                saving: false,

                error: null,

                hasUnsavedChanges: false,

            });

        },

        moveRequest: async (
            workspaceId,
            collectionId,
            requestId,
            targetCollectionId
        ) => {

            set({
                loading: true,
                error: null,
            });


            try {

                // ==========================================
                // Move request on backend
                // ==========================================

                const movedRequest =
                    await requestService.moveRequest(
                        workspaceId,
                        collectionId,
                        requestId,
                        targetCollectionId
                    );


                // ==========================================
                // Remove request from current collection
                // ==========================================

                set((state) => {

                    const isSelected =
                        state.selectedRequest?.id ===
                        requestId;


                    return {

                        requests:
                            state.requests.filter(
                                (request) =>
                                    request.id !== requestId
                            ),

                        selectedRequest:
                            isSelected
                                ? null
                                : state.selectedRequest,

                        hasUnsavedChanges:
                            isSelected
                                ? false
                                : state.hasUnsavedChanges,

                        loading: false,
                        saving: false,

                        error: null,

                    };

                });


                return movedRequest;

            } catch (error) {

                console.error(
                    "Failed to move request:",
                    error
                );


                set({

                    loading: false,

                    error:
                    getApiErrorMessage(
                        error,
                        "Failed to move request."
                    ),

                });


                return null;
            }
        },

    }));