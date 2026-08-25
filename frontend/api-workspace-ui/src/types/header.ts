export interface HeaderResponse {
    id: number;
    headerKey: string;
    headerValue: string;
    enabled: boolean;
}

export interface CreateHeaderRequest {
    headerKey: string;
    headerValue: string;
    enabled: boolean;
}
