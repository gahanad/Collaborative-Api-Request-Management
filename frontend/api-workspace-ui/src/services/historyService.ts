// src/services/historyService.ts

import api from "./api";

import type {
    HistoryResponse,
} from "../types/history";


// ==========================================
// Execution History Service
// ==========================================

export const historyService = {

    // ==========================================
    // Get execution history for a request
    // ==========================================

    getExecutionHistory: async (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<HistoryResponse[]> => {

        const response =
            await api.get<HistoryResponse[]>(
                `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}/history`
            );

        return response.data;
    },

    // ==========================================
    // Delete One History Entry
    // ==========================================

    deleteHistory: async (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        historyId: number
    ): Promise<void> => {

        await api.delete(
            `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}/history/${historyId}`
        );
    },


    // ==========================================
    // Clear All History
    // ==========================================

    clearHistory: async (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<void> => {

        await api.delete(
            `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}/history`
        );
    },

};