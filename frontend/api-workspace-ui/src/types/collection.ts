import type { UserSummary } from "./user";
import type { WorkspaceSummary } from "./workspace";

export interface CollectionSummary {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    createdBy: UserSummary;
    workspace: WorkspaceSummary;
}

export interface CreateCollectionRequest {
    name: string;
    description?: string;
}

export interface UpdateCollectionRequest {
    name: string;
    description?: string;
}