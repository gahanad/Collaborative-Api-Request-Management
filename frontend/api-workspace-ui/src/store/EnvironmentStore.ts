import { create } from "zustand";

import type {
    Environment,
    EnvironmentVariable,

    CreateEnvironmentRequest,
    UpdateEnvironmentRequest,

    CreateEnvironmentVariableRequest,
    UpdateEnvironmentVariableRequest} from "../services/environmentService";

import {  createEnvironment,
    getAllEnvironments,
    getEnvironment,
    updateEnvironment,
    deleteEnvironment,

    createEnvironmentVariable,
    getEnvironmentVariables,
    updateEnvironmentVariable,
    deleteEnvironmentVariable,
} from "../services/environmentService";


// ==========================================
// Store State
// ==========================================

interface EnvironmentState {

    // --------------------------------------
    // Environments
    // --------------------------------------

    environments: Environment[];

    selectedEnvironment: Environment | null;

    // --------------------------------------
    // Variables
    // --------------------------------------

    variables: EnvironmentVariable[];

    // --------------------------------------
    // Loading
    // --------------------------------------

    loading: boolean;

    variableLoading: boolean;

    // --------------------------------------
    // Errors
    // --------------------------------------

    error: string | null;

    variableError: string | null;


    // ======================================
    // Environment Actions
    // ======================================

    fetchEnvironments: (
        workspaceId: number
    ) => Promise<void>;

    fetchEnvironment: (
        workspaceId: number,
        environmentId: number
    ) => Promise<void>;

    createEnvironment: (
        workspaceId: number,
        request: CreateEnvironmentRequest
    ) => Promise<Environment | null>;

    updateEnvironment: (
        workspaceId: number,
        environmentId: number,
        request: UpdateEnvironmentRequest
    ) => Promise<Environment | null>;

    deleteEnvironment: (
        workspaceId: number,
        environmentId: number
    ) => Promise<boolean>;


    // ======================================
    // Selection
    // ======================================

    setSelectedEnvironment: (
        environment: Environment | null
    ) => void;

    clearSelectedEnvironment: () => void;


    // ======================================
    // Variable Actions
    // ======================================

    fetchVariables: (
        environmentId: number
    ) => Promise<void>;

    createVariable: (
        environmentId: number,
        request: CreateEnvironmentVariableRequest
    ) => Promise<EnvironmentVariable | null>;

    updateVariable: (
        variableId: number,
        request: UpdateEnvironmentVariableRequest
    ) => Promise<EnvironmentVariable | null>;

    deleteVariable: (
        variableId: number
    ) => Promise<boolean>;


    // ======================================
    // Clear
    // ======================================

    clearEnvironmentState: () => void;
}


// ==========================================
// Zustand Store
// ==========================================

export const useEnvironmentStore =
    create<EnvironmentState>((set, get) => ({

        // ======================================
        // Initial State
        // ======================================

        environments: [],

        selectedEnvironment: null,

        variables: [],

        loading: false,

        variableLoading: false,

        error: null,

        variableError: null,
        

        // ======================================
        // Fetch All Environments
        // ======================================

        fetchEnvironments: async (
            workspaceId
        ) => {

            set({
                loading: true,
                error: null,
            });

            try {

                const environments =
                    await getAllEnvironments(
                        workspaceId
                    );
                console.log(
                    "ENVIRONMENTS FETCHED:",
                    environments
                );

                set({
                    environments,
                    loading: false,
                });


                // --------------------------------
                // Automatically select first
                // environment if nothing selected
                // --------------------------------

                const currentSelected =
                get().selectedEnvironment;

                const selectedStillExists =
                    currentSelected &&
                    environments.some(
                        (environment) =>
                            environment.id ===
                            currentSelected.id
                    );

                if (!selectedStillExists) {

                    set({
                        selectedEnvironment:
                            environments.length > 0
                                ? environments[0]
                                : null,

                        variables: [],
                    });
                }
            } catch (error: any) {

                console.error(
                    "Failed to fetch environments:",
                    error
                );
                console.error(
                    "FAILED TO FETCH ENVIRONMENTS:",
                    error
                );

                console.error(
                    "STATUS:",
                    error?.response?.status
                );

                console.error(
                    "RESPONSE:",
                    error?.response?.data
                );
                set({
                    loading: false,
                    error:
                        error?.response?.data?.message ||
                        "Failed to load environments",
                });
            }
        },


        // ======================================
        // Fetch One Environment
        // ======================================

        fetchEnvironment: async (
            workspaceId,
            environmentId
        ) => {

            set({
                loading: true,
                error: null,
            });

            try {

                const environment =
                    await getEnvironment(
                        workspaceId,
                        environmentId
                    );
                

                set({
                    selectedEnvironment:
                        environment,

                    loading: false,
                });

            } catch (error: any) {

                console.error(
                    "Failed to fetch environment:",
                    error
                );

                set({
                    loading: false,
                    error:
                        error?.response?.data?.message ||
                        "Failed to load environment",
                });
            }
        },


        // ======================================
        // Create Environment
        // ======================================

        createEnvironment: async (
            workspaceId,
            request
        ) => {

            set({
                loading: true,
                error: null,
            });

            try {

                const environment =
                    await createEnvironment(
                        workspaceId,
                        request
                    );


                set((state) => ({

                    environments: [
                        ...state.environments,
                        environment,
                    ],

                    selectedEnvironment:
                        environment,

                    loading: false,

                    error: null,
                }));

                return environment;

            } catch (error: any) {

                console.error(
                    "Failed to create environment:",
                    error
                );

                set({
                    loading: false,
                    error:
                        error?.response?.data?.message ||
                        "Failed to create environment",
                });

                return null;
            }
        },


        // ======================================
        // Update Environment
        // ======================================

        updateEnvironment: async (
            workspaceId,
            environmentId,
            request
        ) => {

            set({
                loading: true,
                error: null,
            });

            try {

                const updatedEnvironment =
                    await updateEnvironment(
                        workspaceId,
                        environmentId,
                        request
                    );


                set((state) => ({

                    environments:
                        state.environments.map(
                            (environment) =>
                                environment.id ===
                                environmentId
                                    ? updatedEnvironment
                                    : environment
                        ),

                    selectedEnvironment:
                        state.selectedEnvironment?.id ===
                        environmentId
                            ? updatedEnvironment
                            : state.selectedEnvironment,

                    loading: false,

                    error: null,
                }));

                return updatedEnvironment;

            } catch (error: any) {

                console.error(
                    "Failed to update environment:",
                    error
                );

                set({
                    loading: false,
                    error:
                        error?.response?.data?.message ||
                        "Failed to update environment",
                });

                return null;
            }
        },


        // ======================================
        // Delete Environment
        // ======================================

        deleteEnvironment: async (
            workspaceId,
            environmentId
        ) => {

            set({
                loading: true,
                error: null,
            });

            try {

                await deleteEnvironment(
                    workspaceId,
                    environmentId
                );


                set((state) => {

                    const remaining =
                        state.environments.filter(
                            (environment) =>
                                environment.id !==
                                environmentId
                        );


                    const wasSelected =
                        state.selectedEnvironment?.id ===
                        environmentId;


                    return {

                        environments: remaining,

                        selectedEnvironment:
                            wasSelected
                                ? (
                                    remaining.length > 0
                                        ? remaining[0]
                                        : null
                                )
                                : state.selectedEnvironment,

                        variables:
                            wasSelected
                                ? []
                                : state.variables,

                        loading: false,

                        error: null,
                    };
                });

                return true;

            } catch (error: any) {

                console.error(
                    "Failed to delete environment:",
                    error
                );

                set({
                    loading: false,
                    error:
                        error?.response?.data?.message ||
                        "Failed to delete environment",
                });

                return false;
            }
        },


        // ======================================
        // Select Environment
        // ======================================

        setSelectedEnvironment: (
            environment
        ) => {

            set({

                selectedEnvironment:
                    environment,

                variables: [],

                variableError: null,
            });
        },


        // ======================================
        // Clear Selection
        // ======================================

        clearSelectedEnvironment: () => {

            set({

                selectedEnvironment: null,

                variables: [],

                variableError: null,
            });
        },


        // ======================================
        // Fetch Variables
        // ======================================

        fetchVariables: async (
            environmentId
        ) => {

            set({
                variableLoading: true,
                variableError: null,
            });

            try {

                const variables =
                    await getEnvironmentVariables(
                        environmentId
                    );

                set({

                    variables,

                    variableLoading: false,

                });

            } catch (error: any) {

                console.error(
                    "Failed to fetch variables:",
                    error
                );

                set({

                    variableLoading: false,

                    variableError:
                        error?.response?.data?.message ||
                        "Failed to load variables",

                });
            }
        },


        // ======================================
        // Create Variable
        // ======================================

        createVariable: async (
            environmentId,
            request
        ) => {

            set({
                variableLoading: true,
                variableError: null,
            });

            try {

                const variable =
                    await createEnvironmentVariable(
                        environmentId,
                        request
                    );


                set((state) => ({

                    variables: [
                        ...state.variables,
                        variable,
                    ],

                    variableLoading: false,

                    variableError: null,

                }));

                return variable;

            } catch (error: any) {

                console.error(
                    "Failed to create variable:",
                    error
                );

                set({

                    variableLoading: false,

                    variableError:
                        error?.response?.data?.message ||
                        "Failed to create variable",

                });

                return null;
            }
        },


        // ======================================
        // Update Variable
        // ======================================

        updateVariable: async (
            variableId,
            request
        ) => {

            set({
                variableLoading: true,
                variableError: null,
            });

            try {

                const updatedVariable =
                    await updateEnvironmentVariable(
                        variableId,
                        request
                    );


                set((state) => ({

                    variables:
                        state.variables.map(
                            (variable) =>
                                variable.id ===
                                variableId
                                    ? updatedVariable
                                    : variable
                        ),

                    variableLoading: false,

                    variableError: null,

                }));

                return updatedVariable;

            } catch (error: any) {

                console.error(
                    "Failed to update variable:",
                    error
                );

                set({

                    variableLoading: false,

                    variableError:
                        error?.response?.data?.message ||
                        "Failed to update variable",

                });

                return null;
            }
        },


        // ======================================
        // Delete Variable
        // ======================================

        deleteVariable: async (
            variableId
        ) => {

            set({
                variableLoading: true,
                variableError: null,
            });

            try {

                await deleteEnvironmentVariable(
                    variableId
                );


                set((state) => ({

                    variables:
                        state.variables.filter(
                            (variable) =>
                                variable.id !==
                                variableId
                        ),

                    variableLoading: false,

                    variableError: null,

                }));

                return true;

            } catch (error: any) {

                console.error(
                    "Failed to delete variable:",
                    error
                );

                set({

                    variableLoading: false,

                    variableError:
                        error?.response?.data?.message ||
                        "Failed to delete variable",

                });

                return false;
            }
        },


        // ======================================
        // Clear Entire Environment State
        // ======================================

        clearEnvironmentState: () => {

            set({

                environments: [],

                selectedEnvironment: null,

                variables: [],

                loading: false,

                variableLoading: false,

                error: null,

                variableError: null,

            });
        },

    }));