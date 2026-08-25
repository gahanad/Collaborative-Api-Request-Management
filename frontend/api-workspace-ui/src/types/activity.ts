// ==========================================
// Activity Actions
// ==========================================

export type ActivityAction =
    | "CREATED"
    | "UPDATED"
    | "DELETED"
    | "EXECUTED"
    | "RUN_COLLECTION";


// ==========================================
// Resource Types
// ==========================================

export type ResourceType =
    | "WORKSPACE"
    | "COLLECTION"
    | "REQUEST"
    | "ENVIRONMENT"
    | "VARIABLE";


// ==========================================
// Activity Log Response
// ==========================================

export interface ActivityLogResponse {

    id: number;

    userName: string;

    action: ActivityAction;

    resourceType: ResourceType;

    resourceName: string;

    createdAt: string;
}


export interface ActivityLogPageResponse {

    content: ActivityLogResponse[];

    page: number;

    size: number;

    totalElements: number;

    totalPages: number;

    first: boolean;

    last: boolean;
}