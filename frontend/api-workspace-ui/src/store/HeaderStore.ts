import { create } from "zustand";

import type {
    HeaderResponse,
    CreateHeaderRequest,
} from "../types/header";

import { headerService } from "../services/headerService";

interface HeaderStore {

    // --------------------------------
    // State
    // --------------------------------

    headers: HeaderResponse[];

    loading: boolean;

    error: string | null;


    // --------------------------------
    // Fetch
    // --------------------------------

    fetchHeaders: (
        workspaceId: number,
        collectionId: number,
        requestId: number
    ) => Promise<void>;


    // --------------------------------
    // CRUD
    // --------------------------------

    createHeader: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        request: CreateHeaderRequest
    ) => Promise<HeaderResponse | null>;

    updateHeader: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        headerId: number,
        request: CreateHeaderRequest
    ) => Promise<HeaderResponse | null>;

    deleteHeader: (
        workspaceId: number,
        collectionId: number,
        requestId: number,
        headerId: number
    ) => Promise<void>;


    // --------------------------------
    // Cleanup
    // --------------------------------

    clearHeaders: () => void;
}


export const useHeaderStore = create<HeaderStore>((set) => ({

    // ==================================
    // Initial State
    // ==================================

    headers: [],

    loading: false,

    error: null,


    // ==================================
    // Fetch All Headers
    // ==================================

    fetchHeaders: async (
        workspaceId,
        collectionId,
        requestId
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            const headers =
                await headerService.getAllHeaders(
                    workspaceId,
                    collectionId,
                    requestId
                );

            set({
                headers,
                loading: false,
            });

        } catch (error) {

            console.error(
                "Failed to fetch headers:",
                error
            );

            set({
                headers: [],
                loading: false,
                error: "Failed to load headers.",
            });

        }

    },


    // ==================================
    // Create Header
    // ==================================

    createHeader: async (
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

            const createdHeader =
                await headerService.createHeader(
                    workspaceId,
                    collectionId,
                    requestId,
                    request
                );

            set((state) => ({

                headers: [
                    ...state.headers,
                    createdHeader,
                ],

                loading: false,

            }));

            return createdHeader;

        } catch (error) {

            console.error(
                "Failed to create header:",
                error
            );

            set({
                loading: false,
                error: "Failed to create header.",
            });

            return null;
        }

    },


    // ==================================
    // Update Header
    // ==================================

    updateHeader: async (
        workspaceId,
        collectionId,
        requestId,
        headerId,
        request
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            const updatedHeader =
                await headerService.updateHeader(
                    workspaceId,
                    collectionId,
                    requestId,
                    headerId,
                    request
                );

            set((state) => ({

                headers: state.headers.map(
                    (header) =>
                        header.id === headerId
                            ? updatedHeader
                            : header
                ),

                loading: false,

            }));

            return updatedHeader;

        } catch (error) {

            console.error(
                "Failed to update header:",
                error
            );

            set({
                loading: false,
                error: "Failed to update header.",
            });

            return null;
        }

    },


    // ==================================
    // Delete Header
    // ==================================

    deleteHeader: async (
        workspaceId,
        collectionId,
        requestId,
        headerId
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            await headerService.deleteHeader(
                workspaceId,
                collectionId,
                requestId,
                headerId
            );

            set((state) => ({

                headers: state.headers.filter(
                    (header) =>
                        header.id !== headerId
                ),

                loading: false,

            }));

        } catch (error) {

            console.error(
                "Failed to delete header:",
                error
            );

            set({
                loading: false,
                error: "Failed to delete header.",
            });

        }

    },


    // ==================================
    // Clear
    // ==================================

    clearHeaders: () => {

        set({

            headers: [],

            loading: false,

            error: null,

        });

    },

}));