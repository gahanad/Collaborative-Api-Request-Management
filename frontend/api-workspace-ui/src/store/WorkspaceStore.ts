import { create } from "zustand";

import workspaceService from "../services/workspaceService";

import type {

    WorkspaceSummary,

    WorkspaceDetail,

    WorkspaceCreateRequest

}

from "../types/workspace";

interface WorkspaceState{

    workspaces: WorkspaceSummary[];

    selectedWorkspace: WorkspaceDetail | null;

    loading:boolean;

    fetchWorkspaces:()=>Promise<void>;

    fetchWorkspaceById:(

        workspaceId:number

    )=>Promise<void>;

    createWorkspace:(

        data:WorkspaceCreateRequest

    )=>Promise<void>;

    deleteWorkspace:(

        workspaceId:number

    )=>Promise<void>;

    clearSelectedWorkspace:()=>void;

    invitations: any[];
    fetchInvitations: () => Promise<void>;
    acceptInvitation: (inviteId: number) => Promise<void>;
    rejectInvitation: (inviteId: number) => Promise<void>;

}

export const useWorkspaceStore =

create<WorkspaceState>((set, get)=>({

    workspaces:[],

    selectedWorkspace:null,

    loading:false,

    fetchWorkspaces:async()=>{

        set({

            loading:true

        });

        try{

            const workspaces=

                await workspaceService
                    .getAllWorkspaces();

            set({

                workspaces,

                loading:false

            });

        }

        catch(error){

            console.error(error);

            set({

                loading:false

            });

        }

    },

    fetchWorkspaceById:async(

        workspaceId

    )=>{

        set({

            loading:true

        });

        try{

            const workspace=

                await workspaceService
                    .getWorkspaceById(
                        workspaceId
                    );

            set({

                selectedWorkspace:
                    workspace,

                loading:false

            });

        }

        catch(error){

            console.error(error);

            set({

                loading:false

            });

        }

    },

    createWorkspace:async(

        data

    )=>{

        await workspaceService
            .createWorkspace(data);

        await useWorkspaceStore
            .getState()
            .fetchWorkspaces();

    },

    deleteWorkspace:async(

        workspaceId

    )=>{

        await workspaceService
            .deleteWorkspace(
                workspaceId
            );

        await useWorkspaceStore
            .getState()
            .fetchWorkspaces();

    },

    clearSelectedWorkspace:()=>{

        set({

            selectedWorkspace:null

        });

    },
        invitations: [],

    fetchInvitations: async () => {
        try {
            const data = await workspaceService.getMyInvites();
            set({ invitations: data });
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        }
    },

    acceptInvitation: async (inviteId) => {
        try {
            await workspaceService.acceptInvite(inviteId);
            await get().fetchInvitations(); // Refresh invites
            await get().fetchWorkspaces();  // Refresh dashboard to show new workspace
            alert("Invitation accepted!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to accept invitation");
        }
    },

    rejectInvitation: async (inviteId) => {
        try {
            await workspaceService.rejectInvite(inviteId);
            await get().fetchInvitations(); // Refresh invites
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to reject invitation");
        }
    },

}));

