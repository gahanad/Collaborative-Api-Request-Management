import { create } from "zustand";

import type {
    QueryParamResponse,
    CreateQueryParamRequest,
} from "../types/queryParam";

import { queryParamService } from "../services/queryParamService";

interface QueryParamStore {

    // --------------------------------
    // State
    // --------------------------------

    queryParams: QueryParamResponse[];

    loading: boolean;

    error: string | null;


    // --------------------------------
    // Fetch
    // --------------------------------

    fetchQueryParams: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<void>;


    // --------------------------------
    // CRUD
    // --------------------------------

    createQueryParam: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        request: CreateQueryParamRequest
    ) => Promise<QueryParamResponse | null>;

    updateQueryParam: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        paramId: number,
        request: CreateQueryParamRequest
    ) => Promise<QueryParamResponse | null>;

    deleteQueryParam: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        paramId: number
    ) => Promise<void>;


    // --------------------------------
    // Cleanup
    // --------------------------------

    clearQueryParams: () => void;
}


export const useQueryParamStore = create<QueryParamStore>((set) => ({

    // ==================================
    // Initial State
    // ==================================

    queryParams: [],

    loading: false,

    error: null,


    // ==================================
    // Fetch All Query Params
    // ==================================

    fetchQueryParams: async (
        workspaceId,
        collectionId,
        requestId
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            const queryParams =
                await queryParamService.getAllQueryParams(
                    workspaceId,
                    collectionId,
                    requestId
                );

            set({
                queryParams,
                loading: false,
            });

        } catch (error) {

            console.error(
                "Failed to fetch query parameters:",
                error
            );

            set({
                queryParams: [],
                loading: false,
                error: "Failed to load query parameters.",
            });

        }

    },


    // ==================================
    // Create Query Param
    // ==================================

    createQueryParam: async (
        workspaceId,
        collectionId,
        requestId,
        request
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            const createdParam =
                await queryParamService.createQueryParam(
                    workspaceId,
                    collectionId,
                    requestId,
                    request
                );

            set((state) => ({

                queryParams: [
                    ...state.queryParams,
                    createdParam,
                ],

                loading: false,

            }));

            return createdParam;

        } catch (error) {

            console.error(
                "Failed to create query parameter:",
                error
            );

            set({
                loading: false,
                error: "Failed to create query parameter.",
            });

            return null;
        }

    },


    // ==================================
    // Update Query Param
    // ==================================

    updateQueryParam: async (
        workspaceId,
        collectionId,
        requestId,
        paramId,
        request
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            const updatedParam =
                await queryParamService.updateQueryParam(
                    workspaceId,
                    collectionId,
                    requestId,
                    paramId,
                    request
                );

            set((state) => ({

                queryParams: state.queryParams.map(
                    (param) =>
                        param.id === paramId
                            ? updatedParam
                            : param
                ),

                loading: false,

            }));

            return updatedParam;

        } catch (error) {

            console.error(
                "Failed to update query parameter:",
                error
            );

            set({
                loading: false,
                error: "Failed to update query parameter.",
            });

            return null;
        }

    },


    // ==================================
    // Delete Query Param
    // ==================================

    deleteQueryParam: async (
        workspaceId,
        collectionId,
        requestId,
        paramId
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            await queryParamService.deleteQueryParam(
                workspaceId,
                collectionId,
                requestId,
                paramId
            );

            set((state) => ({

                queryParams: state.queryParams.filter(
                    (param) =>
                        param.id !== paramId
                ),

                loading: false,

            }));

        } catch (error) {

            console.error(
                "Failed to delete query parameter:",
                error
            );

            set({
                loading: false,
                error: "Failed to delete query parameter.",
            });

        }

    },


    // ==================================
    // Clear
    // ==================================

    clearQueryParams: () => {

        set({

            queryParams: [],

            loading: false,

            error: null,

        });

    },

}));