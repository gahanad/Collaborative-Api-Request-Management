import api from "./api";

import type{

    Workspace,

    CreateWorkspaceRequest,

    UpdateWorkspaceRequest

}

from "../types/workspace";

export interface InviteRequest {
    email: string;
    role: "ADMIN" | "EDITOR" | "VIEWER";
}

export interface WorkspaceInviteResponse {
    id: number;
    workspaceName: string;
    invitedByName: string;
    role: string;
    status: string;
    createdAt: string;
}

const workspaceService = {

    async getAllWorkspaces():

    Promise<Workspace[]>{

        const response =

            await api.get<Workspace[]>(

                "/workspaces"

            );

        return response.data;

    },

    async getWorkspaceById(

        workspaceId:number

    ):Promise<Workspace>{

        const response=

            await api.get<Workspace>(

                `/workspaces/${workspaceId}`

            );

        return response.data;

    },

    async createWorkspace(

        data:CreateWorkspaceRequest

    ):Promise<Workspace>{

        const response=

            await api.post<Workspace>(

                "/workspaces",

                data

            );

        return response.data;

    },

    async updateWorkspace(

        workspaceId:number,

        data:UpdateWorkspaceRequest

    ):Promise<Workspace>{

        const response=

            await api.put<Workspace>(

                `/workspaces/${workspaceId}`,

                data

            );

        return response.data;

    },

    async deleteWorkspace(

        workspaceId:number

    ):Promise<void>{

        await api.delete(

            `/workspaces/${workspaceId}`

        );

    },
    // For invite requests
    inviteUser: async (workspaceId: number, data: InviteRequest): Promise<string> => {
        const response = await api.post(`/workspaces/${workspaceId}/invite`, data);
        return response.data;
    },
    getMyInvites: async (): Promise<WorkspaceInviteResponse[]> => {
        const response = await api.get('/workspace-invites');
        return response.data;
    },
    acceptInvite: async (inviteId: number): Promise<string> => {
        const response = await api.post(`/workspace-invites/${inviteId}/accept`);
        return response.data;
    },
    rejectInvite: async (inviteId: number): Promise<string> => {
        const response = await api.post(`/workspace-invites/${inviteId}/reject`);
        return response.data;
    }

};

export default workspaceService;