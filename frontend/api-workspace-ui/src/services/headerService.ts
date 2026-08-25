import api from "./api";

import type {
    HeaderResponse,
    CreateHeaderRequest,
} from "../types/header";

const WORKSPACE_BASE_URL = "/workspaces";

export const headerService = {

    // --------------------------------
    // Get all headers
    // --------------------------------

    async getAllHeaders(
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<HeaderResponse[]> {

        const response = await api.get<HeaderResponse[]>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/headers`
        );

        return response.data;
    },


    // --------------------------------
    // Get single header
    // --------------------------------

    async getHeader(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        headerId: number
    ): Promise<HeaderResponse> {

        const response = await api.get<HeaderResponse>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/headers/${headerId}`
        );

        return response.data;
    },


    // --------------------------------
    // Create header
    // --------------------------------

    async createHeader(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        request: CreateHeaderRequest
    ): Promise<HeaderResponse> {

        const response = await api.post<HeaderResponse>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/headers`,
            request
        );

        return response.data;
    },


    // --------------------------------
    // Update header
    // --------------------------------

    async updateHeader(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        headerId: number,
        request: CreateHeaderRequest
    ): Promise<HeaderResponse> {

        const response = await api.put<HeaderResponse>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/headers/${headerId}`,
            request
        );

        return response.data;
    },


    // --------------------------------
    // Delete header
    // --------------------------------

    async deleteHeader(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        headerId: number
    ): Promise<void> {

        await api.delete(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/headers/${headerId}`
        );
    },

};