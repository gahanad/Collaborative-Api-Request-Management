import axios from "axios";


export function getApiErrorMessage(
    error: unknown,
    fallback: string
): string {

    if (axios.isAxiosError(error)) {

        const message =
            error.response?.data?.message;


        if (
            typeof message === "string" &&
            message.trim()
        ) {

            return message;

        }


        if (
            typeof error.response?.data ===
            "string" &&
            error.response.data.trim()
        ) {

            return error.response.data;

        }


        if (error.response?.status === 401) {

            return "Your session has expired. Please log in again.";

        }


        if (error.response?.status === 403) {

            return "You do not have permission to perform this action.";

        }


        if (error.response?.status === 404) {

            return "The requested resource was not found.";

        }


        if (error.response?.status === 409) {

            return "This operation conflicts with the current state.";

        }


        if (!error.response) {

            return "Unable to connect to the server.";

        }

    }


    if (error instanceof Error) {

        return error.message;

    }


    return fallback;
}