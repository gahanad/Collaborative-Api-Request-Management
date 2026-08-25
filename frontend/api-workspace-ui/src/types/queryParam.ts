export interface QueryParamResponse {
    id: number;
    paramKey: string;
    paramValue: string;
    enabled: boolean;
}

export interface CreateQueryParamRequest {
    paramKey: string;
    paramValue: string;
    enabled: boolean;
}