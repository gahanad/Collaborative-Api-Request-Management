import type { UserSummary } from "./user";
import type { CollectionSummary } from "./collection";

export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEAD"
    | "OPTIONS";

export type AuthType =
    | "NONE"
    | "BEARER"
    | "BASIC"
    | "API_KEY";

export interface AuthorizationResponse {
    id: number;
    authType: AuthType;

    bearerToken: string | null;

    username: string | null;

    password: string | null;

    apiKey: string | null;

    apiKeyName: string | null;

    apiKeyLocation: string | null;
}

export interface RequestHeader {
    id: number;
    key: string;
    value: string;
}

export interface RequestQueryParam {
    id: number;
    key: string;
    value: string;
}

export interface RequestSummary {
    id: number;

    name: string;

    description: string | null;

    method: HttpMethod;

    url: string;

    body: string | null;

    createdAt: string;

    updatedAt: string;

    createdBy: UserSummary;

    collection: CollectionSummary;

    authorization: AuthorizationResponse | null;
}

export interface RequestDetail extends RequestSummary {
    headers: RequestHeader[];

    queryParams: RequestQueryParam[];
}

export interface CreateRequestRequest {
    name: string;

    description?: string;

    method: HttpMethod;

    url: string;

    body?: string | null;

    authType?: AuthType;

    bearerToken?: string;

    username?: string;

    password?: string;

    apiKeyName?: string;

    apiKey?: string;

    apiKeyLocation?: string;
}

export interface UpdateRequestRequest {
    name: string;

    description?: string | null;

    method: HttpMethod;

    url: string;

    body?: string | null;

    authType?: AuthType;

    bearerToken?: string | null;

    username?: string | null;

    password?: string | null;

    apiKeyName?: string | null;

    apiKey?: string | null;

    apiKeyLocation?: string | null;
}

export interface MoveRequestRequest {
    targetCollectionId: number;
}