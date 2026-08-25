import api from "./api";

import type {
    ActivityAction,
    ActivityLogPageResponse,
    ResourceType,
} from "../types/activity";


export const activityService = {

    getWorkspaceActivity: async (
        workspaceId: number,
        page: number = 0,
        size: number = 20,
        action?: ActivityAction,
        resourceType?: ResourceType
    ): Promise<ActivityLogPageResponse> => {

        const response =
            await api.get<ActivityLogPageResponse>(
                `/workspaces/${workspaceId}/activity`,
                {
                    params: {
                        page,
                        size,
                        action,
                        resourceType,
                    },
                }
            );


        return response.data;
    },

};