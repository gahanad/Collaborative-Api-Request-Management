import { create } from "zustand";

import { activityService } from "../services/activityService";

import type {
    ActivityAction,
    ActivityLogResponse,
    ResourceType,
} from "../types/activity";


interface ActivityLogState {

    // ==========================================
    // Activity Data
    // ==========================================

    activities: ActivityLogResponse[];


    // ==========================================
    // Pagination
    // ==========================================

    page: number;

    size: number;

    totalElements: number;

    totalPages: number;

    first: boolean;

    last: boolean;


    // ==========================================
    // Loading / Error
    // ==========================================

    loading: boolean;

    error: string | null;


    // ==========================================
    // Filters
    // ==========================================

    action: ActivityAction | "";

    resourceType: ResourceType | "";


    // ==========================================
    // Fetch
    // ==========================================

    fetchActivity: (
        workspaceId: number,
        page?: number
    ) => Promise<void>;


    // ==========================================
    // Filters
    // ==========================================

    setAction: (
        action: ActivityAction | ""
    ) => void;

    setResourceType: (
        resourceType: ResourceType | ""
    ) => void;


    // ==========================================
    // Reset
    // ==========================================

    resetFilters: () => void;

    clearActivity: () => void;

    clearError: () => void;

    refreshActivity: (
        workspaceId: number
    ) => Promise<void>;
}


export const useActivityLogStore =
    create<ActivityLogState>((set, get) => ({

        // ==========================================
        // Initial Activity State
        // ==========================================

        activities: [],


        // ==========================================
        // Initial Pagination
        // ==========================================

        page: 0,

        size: 20,

        totalElements: 0,

        totalPages: 0,

        first: true,

        last: true,


        // ==========================================
        // Initial Loading / Error
        // ==========================================

        loading: false,

        error: null,


        // ==========================================
        // Initial Filters
        // ==========================================

        action: "",

        resourceType: "",


        // ==========================================
        // Fetch Activity
        // ==========================================

        fetchActivity: async (
            workspaceId,
            page = 0
        ) => {

            set({
                loading: true,
                error: null,
            });


            try {

                const state = get();


                const response =
                    await activityService
                        .getWorkspaceActivity(

                            workspaceId,

                            page,

                            state.size,

                            state.action ||
                                undefined,

                            state.resourceType ||
                                undefined

                        );


                set({

                    activities:
                        response.content,

                    page:
                        response.page,

                    size:
                        response.size,

                    totalElements:
                        response.totalElements,

                    totalPages:
                        response.totalPages,

                    first:
                        response.first,

                    last:
                        response.last,

                    loading: false,

                    error: null,

                });

            } catch (error: any) {

                console.error(
                    "Failed to fetch workspace activity:",
                    error
                );


                const message =
                    error?.response?.data?.message ||
                    error?.response?.data ||
                    error?.message ||
                    "Failed to fetch workspace activity";


                set({

                    activities: [],

                    loading: false,

                    error:
                        String(message),

                });

            }

        },


        // ==========================================
        // Set Action Filter
        // ==========================================

        setAction: (
            action
        ) => {

            set({
                action,
            });

        },


        // ==========================================
        // Set Resource Filter
        // ==========================================

        setResourceType: (
            resourceType
        ) => {

            set({
                resourceType,
            });

        },


        // ==========================================
        // Reset Filters
        // ==========================================

        resetFilters: () => {

            set({

                action: "",

                resourceType: "",

                page: 0,

            });

        },


        // ==========================================
        // Clear Activity
        // ==========================================

        clearActivity: () => {

            set({

                activities: [],

                page: 0,

                totalElements: 0,

                totalPages: 0,

                first: true,

                last: true,

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

        // ==========================================
        // Refresh Activity
        // ==========================================

        refreshActivity: async (
            workspaceId
        ) => {

            const state = get();

            await state.fetchActivity(
                workspaceId,
                state.page
            );

        },

    }));