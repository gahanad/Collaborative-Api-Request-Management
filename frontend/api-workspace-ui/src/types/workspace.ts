export interface Workspace {
    id: number;
    name: string;
    description: string;
    createdAt: string;
}

export interface CreateWorkspaceRequest {
    name: string;
    description: string;
}

export interface UpdateWorkspaceRequest {
    name: string;
    description: string;
}


export interface WorkspaceSummary {
    id: number;
    name: string;
    description: string;
    createdAt: string;
}

export interface WorkspaceDetail {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    // Add these later if your DTO includes them
    // createdBy?: UserSummary;
    // collections?: CollectionSummary[];
}

export interface WorkspaceCreateRequest {
    name: string;
    description: string;
}

export interface InviteMemberRequest {
    email: string;
    role: string;
}