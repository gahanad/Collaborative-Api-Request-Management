import api from "./api";

import type {
    QueryParamResponse,
    CreateQueryParamRequest,
} from "../types/queryParam";

const WORKSPACE_BASE_URL = "/workspaces";

export const queryParamService = {

    // --------------------------------
    // Get all query parameters
    // --------------------------------

    async getAllQueryParams(
        workspaceId: number,
        collectionId: number,
        requestId: number
    ): Promise<QueryParamResponse[]> {

        const response = await api.get<QueryParamResponse[]>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/query-params`
        );

        return response.data;
    },


    // --------------------------------
    // Get single query parameter
    // --------------------------------

    async getQueryParam(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        paramId: number
    ): Promise<QueryParamResponse> {

        const response = await api.get<QueryParamResponse>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/query-params/${paramId}`
        );

        return response.data;
    },


    // --------------------------------
    // Create query parameter
    // --------------------------------

    async createQueryParam(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        request: CreateQueryParamRequest
    ): Promise<QueryParamResponse> {

        const response = await api.post<QueryParamResponse>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/query-params`,
            request
        );

        return response.data;
    },


    // --------------------------------
    // Update query parameter
    // --------------------------------

    async updateQueryParam(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        paramId: number,
        request: CreateQueryParamRequest
    ): Promise<QueryParamResponse> {

        const response = await api.put<QueryParamResponse>(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/query-params/${paramId}`,
            request
        );

        return response.data;
    },


    // --------------------------------
    // Delete query parameter
    // --------------------------------

    async deleteQueryParam(
        workspaceId: number,
        collectionId: number,
        requestId: number,
        paramId: number
    ): Promise<void> {

        await api.delete(
            `${WORKSPACE_BASE_URL}/${workspaceId}/collections/${collectionId}/requests/${requestId}/query-params/${paramId}`
        );
    },

};