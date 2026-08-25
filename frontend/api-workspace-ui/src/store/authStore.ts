import { create } from "zustand";

import authService from "../services/authService";

import type {
    LoginRequest,
    SignupRequest
} from "../types/auth";

interface AuthState {

    token: string | null;

    isAuthenticated: boolean;

    login: (data: LoginRequest) => Promise<void>;

    signup: (data: SignupRequest) => Promise<void>;

    logout: () => void;

    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({

    token: localStorage.getItem("token"),

    isAuthenticated: !!localStorage.getItem("token"),

    login: async (data) => {
        const response =
            await authService.login(data);
        if (!response.token) {
            throw new Error("Token not received");
        }
        localStorage.setItem(
            "token",
            response.token
        );
        set({
            token: response.token,
            isAuthenticated: true
        });
    },

    signup: async (data) => {

        await authService.signup(data);
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
            token: null,
            isAuthenticated: false
        });
    },

    initialize: () => {
        const token = localStorage.getItem("token");
        if (token) {
            set({
                token,
                isAuthenticated: true
            });
        }
        // else {
        //     set({
        //         token: null,
        //         isAuthenticated: false
        //     });
        // }
    }
}));