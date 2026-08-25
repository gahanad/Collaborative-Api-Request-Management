import api from "./api";

import type {
    LoginRequest,
    LoginResponse,
    SignupRequest
} from "../types/auth";

const authService = {

    async signup(data: SignupRequest) {

        const response = await api.post(
            "/users/signup",
            data
        );

        return response.data;
    },

    async login(data: LoginRequest): Promise<LoginResponse> {

        const response = await api.post<LoginResponse>(
            "/users/login",
            data
        );

        return response.data;
    },

    logout() {

        localStorage.removeItem("token");
    }
};

export default authService;