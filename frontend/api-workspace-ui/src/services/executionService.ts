// src/services/executionService.ts

import api from "./api";

import type {
    ExecutionResponse,
} from "../types/execution";


// ==========================================
// Execute Request
// ==========================================

export const executionService = {

    executeRequest: async (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        environmentId: number
    ): Promise<ExecutionResponse> => {

        const response =
            await api.post<ExecutionResponse>(
                `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}/execute/${environmentId}`
            );

        return response.data;
    },

};