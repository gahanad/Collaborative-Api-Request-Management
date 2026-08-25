import type {
    ResourceType,
} from "./activity";

export type CollaborationEventType =

    | "COLLECTION_CREATED"
    | "COLLECTION_UPDATED"
    | "COLLECTION_DELETED"

    | "REQUEST_CREATED"
    | "REQUEST_UPDATED"
    | "REQUEST_DELETED"
    | "REQUEST_MOVED"

    | "ENVIRONMENT_CREATED"
    | "ENVIRONMENT_UPDATED"
    | "ENVIRONMENT_DELETED"

    | "VARIABLE_CREATED"
    | "VARIABLE_UPDATED"
    | "VARIABLE_DELETED"

    | "COLLABORATOR_JOINED"
    | "COLLABORATOR_LEFT"
    | "COLLABORATOR_SNAPSHOT";


export type CollaborationResourceType =

    | "WORKSPACE"
    | "COLLECTION"
    | "REQUEST"
    | "ENVIRONMENT"
    | "VARIABLE";

    
export interface CollaborationEvent {

    type: CollaborationEventType;

    workspaceId: number;

    userId: number;

    userName: string;

    timestamp?: string;

    resourceType?: ResourceType;

    resourceId?: number;

    resourceName?: string;

    sourceCollectionId?: number | null;

    targetCollectionId?: number | null;

    collaborators?: CollaboratorSnapshot[];
}

export interface CollaboratorSnapshot {

    userId: number;

    userName: string;
}