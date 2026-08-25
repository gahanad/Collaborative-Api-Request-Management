import { create } from "zustand";

import { executionService } from "../services/executionService";

import type {
    ExecutionResponse,
} from "../types/execution";


// ==========================================
// Execution Store State
// ==========================================

interface ExecutionState {

    // Latest API response
    response: ExecutionResponse | null;

    // Whether an API request is currently executing
    loading: boolean;

    // Error message if execution fails
    error: string | null;


    // Execute API request
    executeRequest: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        environmentId: number
    ) => Promise<boolean>;


    // Clear previous response
    clearResponse: () => void;

    // Clear execution error
    clearError: () => void;
}


// ==========================================
// Execution Store
// ==========================================

export const useExecutionStore =
    create<ExecutionState>((set) => ({

        // ==========================================
        // Initial State
        // ==========================================

        response: null,

        loading: false,

        error: null,


        // ==========================================
        // Execute Request
        // ==========================================

        executeRequest: async (
            workspaceId,
            collectionId,
            requestId,
            environmentId
        ) => {

            // Start loading
            set({
                loading: true,
                error: null,
            });


            try {

                const response =
                    await executionService.executeRequest(
                        workspaceId,
                        collectionId,
                        requestId,
                        environmentId
                    );


                // Store successful response
                set({
                    response,
                    loading: false,
                    error: null,
                });
                return true;

            } catch (error: any) {

                console.error(
                    "Request execution failed:",
                    error
                );


                // Extract useful error message
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data ||
                    error?.message ||
                    "Failed to execute request";


                set({
                    response: null,
                    loading: false,
                    error: String(message),
                });
                return false;

            }
        },


        // ==========================================
        // Clear Response
        // ==========================================

        clearResponse: () => {

            set({
                response: null,
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