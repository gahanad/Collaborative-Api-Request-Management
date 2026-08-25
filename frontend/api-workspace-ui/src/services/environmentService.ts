import api from "./api";


// ==========================================
// Types
// ==========================================

export interface Environment {
    id: number;
    name: string;
    workspaceId: number;
}

export interface EnvironmentVariable {
    id: number;
    variableKey: string;
    variableValue: string;
    environmentId: number;
}

export interface CreateEnvironmentRequest {
    name: string;
}

export interface UpdateEnvironmentRequest {
    name: string;
}

export interface CreateEnvironmentVariableRequest {
    variableKey: string;
    variableValue: string;
}

export interface UpdateEnvironmentVariableRequest {
    variableKey: string;
    variableValue: string;
}


// ==========================================
// Environment APIs
// ==========================================

export async function createEnvironment(
    workspaceId: number,
    request: CreateEnvironmentRequest
): Promise<Environment> {

    const response = await api.post<Environment>(
        `/workspaces/${workspaceId}/environments`,
        request
    );

    return response.data;
}


export async function getAllEnvironments(
    workspaceId: number
): Promise<Environment[]> {

    const response = await api.get<Environment[]>(
        `/workspaces/${workspaceId}/environments`
    );

    return response.data;
}


export async function getEnvironment(
    workspaceId: number,
    environmentId: number
): Promise<Environment> {

    const response = await api.get<Environment>(
        `/workspaces/${workspaceId}/environments/${environmentId}`
    );

    return response.data;
}


export async function updateEnvironment(
    workspaceId: number,
    environmentId: number,
    request: UpdateEnvironmentRequest
): Promise<Environment> {

    const response = await api.put<Environment>(
        `/workspaces/${workspaceId}/environments/${environmentId}`,
        request
    );

    return response.data;
}


export async function deleteEnvironment(
    workspaceId: number,
    environmentId: number
): Promise<void> {

    await api.delete(
        `/workspaces/${workspaceId}/environments/${environmentId}`
    );
}


// ==========================================
// Environment Variable APIs
// ==========================================

export async function createEnvironmentVariable(
    environmentId: number,
    request: CreateEnvironmentVariableRequest
): Promise<EnvironmentVariable> {

    const response =
        await api.post<EnvironmentVariable>(
            `/environments/${environmentId}/variables`,
            request
        );

    return response.data;
}


export async function getEnvironmentVariables(
    environmentId: number
): Promise<EnvironmentVariable[]> {

    const response =
        await api.get<EnvironmentVariable[]>(
            `/environments/${environmentId}/variables`
        );

    return response.data;
}


export async function updateEnvironmentVariable(
    variableId: number,
    request: UpdateEnvironmentVariableRequest
): Promise<EnvironmentVariable> {

    const response =
        await api.put<EnvironmentVariable>(
            `/environments/variables/${variableId}`,
            request
        );

    return response.data;
}


export async function deleteEnvironmentVariable(
    variableId: number
): Promise<void> {

    await api.delete(
        `/environments/variables/${variableId}`
    );
}