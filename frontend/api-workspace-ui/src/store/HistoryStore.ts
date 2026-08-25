import { create } from "zustand";

import { historyService } from "../services/historyService";

import type {
    HistoryResponse,
} from "../types/history";


interface HistoryState {

    history: HistoryResponse[];

    loading: boolean;

    error: string | null;


    fetchHistory: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<void>;


    deleteHistory: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        historyId: number
    ) => Promise<void>;


    clearHistory: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<void>;


    clearHistoryState: () => void;

    clearError: () => void;
}


export const useHistoryStore =
    create<HistoryState>((set) => ({

        history: [],

        loading: false,

        error: null,


        // ==========================================
        // Fetch History
        // ==========================================

        fetchHistory: async (
            workspaceId,
            collectionId,
            requestId
        ) => {

            set({
                loading: true,
                error: null,
            });


            try {

                const history =
                    await historyService.getExecutionHistory(
                        workspaceId,
                        collectionId,
                        requestId
                    );


                set({
                    history,
                    loading: false,
                    error: null,
                });

            } catch (error: any) {

                console.error(
                    "Failed to fetch execution history:",
                    error
                );


                const message =
                    error?.response?.data?.message ||
                    error?.response?.data ||
                    error?.message ||
                    "Failed to fetch execution history";


                set({
                    history: [],
                    loading: false,
                    error: String(message),
                });

            }

        },


        // ==========================================
        // Delete One History Entry
        // ==========================================

        deleteHistory: async (
            workspaceId,
            collectionId,
            requestId,
            historyId
        ) => {

            try {

                await historyService.deleteHistory(
                    workspaceId,
                    collectionId,
                    requestId,
                    historyId
                );


                set((state) => ({
                    history:
                        state.history.filter(
                            (item) =>
                                item.id !== historyId
                        ),
                    error: null,
                }));

            } catch (error: any) {

                console.error(
                    "Failed to delete history:",
                    error
                );


                const message =
                    error?.response?.data?.message ||
                    error?.response?.data ||
                    error?.message ||
                    "Failed to delete execution history";


                set({
                    error: String(message),
                });


                throw error;
            }

        },


        // ==========================================
        // Clear All History
        // ==========================================

        clearHistory: async (
            workspaceId,
            collectionId,
            requestId
        ) => {

            try {

                await historyService.clearHistory(
                    workspaceId,
                    collectionId,
                    requestId
                );


                set({
                    history: [],
                    error: null,
                });

            } catch (error: any) {

                console.error(
                    "Failed to clear history:",
                    error
                );


                const message =
                    error?.response?.data?.message ||
                    error?.response?.data ||
                    error?.message ||
                    "Failed to clear execution history";


                set({
                    error: String(message),
                });


                throw error;
            }

        },


        // ==========================================
        // Clear Local State
        // ==========================================

        clearHistoryState: () => {

            set({
                history: [],
                error: null,
                loading: false,
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