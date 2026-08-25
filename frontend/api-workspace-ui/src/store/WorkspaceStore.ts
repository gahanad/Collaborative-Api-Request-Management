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

}

export const useWorkspaceStore =

create<WorkspaceState>((set)=>({

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

    }

}));

