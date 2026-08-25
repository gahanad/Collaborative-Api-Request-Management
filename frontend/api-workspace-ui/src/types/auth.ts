export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}