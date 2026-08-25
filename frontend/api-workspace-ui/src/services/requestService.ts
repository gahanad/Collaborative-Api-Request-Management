import api from "./api";

import type {
    RequestSummary,
    RequestDetail,
    CreateRequestRequest,
    UpdateRequestRequest,
} from "../types/request";

const WORKSPACE_BASE_URL = "/workspaces";

export const requestService = {

    async getAllRequests(
        workspaceId: number,
        collectionId: number
    ): Promise<RequestSummary[]> {

        const response = await api.get<RequestSummary[]>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/getAllRequests`
        );

        return response.data;

    },

    async getRequestById(
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<RequestDetail> {

        const response = await api.get<RequestDetail>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}`
        );

        return response.data;

    },

    async createRequest(
        workspaceId: number,
        collectionId: number,
        request: CreateRequestRequest
    ): Promise<RequestSummary> {

        const response = await api.post<RequestSummary>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests`,
            request
        );

        return response.data;

    },

    async updateRequest(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        request: UpdateRequestRequest
    ): Promise<RequestSummary> {

        const response = await api.put<RequestSummary>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}`,
            request
        );

        return response.data;

    },

    async deleteRequest(
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<void> {

        await api.delete(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}`
        );

    },

    async duplicateRequest(
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<RequestSummary> {

        const response = await api.post<RequestSummary>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/duplicate`
        );

        return response.data;

    },

    async moveRequest(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        targetCollectionId: number
    ): Promise<RequestSummary> {

        const response =
            await api.patch<RequestSummary>(
                `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/move`,
                {
                    targetCollectionId,
                }
            );

        return response.data;
    }

};