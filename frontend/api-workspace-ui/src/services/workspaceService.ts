import api from "./api";

import type{

    Workspace,

    CreateWorkspaceRequest,

    UpdateWorkspaceRequest

}

from "../types/workspace";

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

    }

};

export default workspaceService;