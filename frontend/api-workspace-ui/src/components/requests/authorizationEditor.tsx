import { useEffect, useState } from "react";

import { useRequestStore } from "../../store/RequestStore";

import type {
    AuthType,
    AuthorizationResponse,
} from "../../types/request";


interface AuthorizationDraft {

    authType: AuthType;

    bearerToken: string;

    username: string;

    password: string;

    apiKeyName: string;

    apiKey: string;

    apiKeyLocation: string;
}


const EMPTY_AUTHORIZATION: AuthorizationDraft = {

    authType: "NONE",

    bearerToken: "",

    username: "",

    password: "",

    apiKeyName: "",

    apiKey: "",

    apiKeyLocation: "HEADER",
};


export default function AuthorizationEditor() {

    const {
        selectedRequest,
        updateRequestDraft,
    } = useRequestStore();


    const [
        draft,
        setDraft,
    ] = useState<AuthorizationDraft>(
        EMPTY_AUTHORIZATION
    );


    const [
        showBearerToken,
        setShowBearerToken,
    ] = useState(false);


    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    const [
        showApiKey,
        setShowApiKey,
    ] = useState(false);


    // ==========================================
    // Load authorization from selected request
    // ==========================================

    useEffect(() => {

        if (!selectedRequest) {

            setDraft(
                EMPTY_AUTHORIZATION
            );

            return;
        }


        const authorization =
            selectedRequest.authorization;


        if (!authorization) {

            setDraft(
                EMPTY_AUTHORIZATION
            );

            return;
        }


        setDraft({

            authType:
                authorization.authType ?? "NONE",

            bearerToken:
                authorization.bearerToken ?? "",

            username:
                authorization.username ?? "",

            password:
                authorization.password ?? "",

            apiKeyName:
                authorization.apiKeyName ?? "",

            apiKey:
                authorization.apiKey ?? "",

            apiKeyLocation:
                authorization.apiKeyLocation ?? "HEADER",

        });


    }, [selectedRequest?.id]);


    // ==========================================
    // Update local draft + RequestStore
    // ==========================================

    const updateAuthorization = (
        updates: Partial<AuthorizationDraft>
    ) => {

        const updatedDraft: AuthorizationDraft = {

            ...draft,

            ...updates,

        };


        setDraft(updatedDraft);


        /*
         * AuthorizationResponse uses `id`.
         *
         * When changing authorization locally,
         * preserve the existing authorization id.
         *
         * If no authorization exists yet,
         * id is set to 0 locally.
         *
         * The backend PUT request will decide whether
         * to create/update the authorization record.
         */

        const currentAuthorization =
            selectedRequest?.authorization;


        const authorization: AuthorizationResponse = {

            id:
                currentAuthorization?.id ?? 0,

            authType:
                updatedDraft.authType,

            bearerToken:
                updatedDraft.bearerToken || null,

            username:
                updatedDraft.username || null,

            password:
                updatedDraft.password || null,

            apiKey:
                updatedDraft.apiKey || null,

            apiKeyName:
                updatedDraft.apiKeyName || null,

            apiKeyLocation:
                updatedDraft.apiKeyLocation || null,

        };


        updateRequestDraft({
            authorization,
        });

    };


    // ==========================================
    // No request
    // ==========================================

    if (!selectedRequest) {

        return (

            <div className="p-5">

                <div className="rounded-lg border bg-white p-6">

                    <p className="text-sm text-gray-500">
                        Select a request to configure authorization.
                    </p>

                </div>

            </div>

        );
    }


    return (

        <div className="space-y-5 p-5">

            {/* ==================================
                Header
            ================================== */}

            <div>

                <h3 className="text-sm font-semibold text-gray-900">
                    Authorization
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Configure how this request authenticates with the API.
                </p>

            </div>


            {/* ==================================
                Auth Type
            ================================== */}

            <div className="rounded-lg border bg-white p-4">

                <label
                    htmlFor="auth-type"
                    className="block text-sm font-medium text-gray-700"
                >
                    Authorization Type
                </label>


                <div className="mt-2">

                    <select
                        id="auth-type"
                        value={draft.authType}
                        onChange={(event) =>
                            updateAuthorization({
                                authType:
                                    event.target.value as AuthType,
                            })
                        }
                        className="
                            h-10
                            w-full
                            max-w-md
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            text-sm
                            text-gray-800
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                        "
                    >

                        <option value="NONE">
                            No Auth
                        </option>

                        <option value="BEARER">
                            Bearer Token
                        </option>

                        <option value="BASIC">
                            Basic Auth
                        </option>

                        <option value="API_KEY">
                            API Key
                        </option>

                    </select>

                </div>

            </div>


            {/* ==================================
                No Auth
            ================================== */}

            {draft.authType === "NONE" && (

                <div className="rounded-lg border bg-white p-5">

                    <div className="flex items-start gap-3">

                        <div className="mt-0.5 text-lg">
                            🔓
                        </div>

                        <div>

                            <h4 className="text-sm font-semibold text-gray-800">
                                No Authentication
                            </h4>

                            <p className="mt-1 text-xs text-gray-500">
                                This request will be sent without authentication credentials.
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
                Bearer Token
            ================================== */}

            {draft.authType === "BEARER" && (

                <div className="rounded-lg border bg-white p-5">

                    <div>

                        <h4 className="text-sm font-semibold text-gray-800">
                            Bearer Token
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                            The token will be sent using the Authorization header.
                        </p>

                    </div>


                    <div className="mt-4 max-w-2xl">

                        <label
                            htmlFor="bearer-token"
                            className="block text-xs font-medium text-gray-700"
                        >
                            Token
                        </label>


                        <div className="relative mt-1">

                            <input
                                id="bearer-token"
                                type={
                                    showBearerToken
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    draft.bearerToken
                                }
                                onChange={(event) =>
                                    updateAuthorization({
                                        bearerToken:
                                            event.target.value,
                                    })
                                }
                                placeholder="Enter bearer token"
                                autoComplete="off"
                                className="
                                    h-10
                                    w-full
                                    rounded-md
                                    border
                                    border-gray-300
                                    px-3
                                    pr-20
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowBearerToken(
                                        (current) =>
                                            !current
                                    )
                                }
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    -translate-y-1/2
                                    rounded
                                    px-2
                                    py-1
                                    text-xs
                                    text-gray-500
                                    hover:bg-gray-100
                                    hover:text-gray-800
                                "
                            >
                                {showBearerToken
                                    ? "Hide"
                                    : "Show"
                                }
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
                Basic Auth
            ================================== */}

            {draft.authType === "BASIC" && (

                <div className="rounded-lg border bg-white p-5">

                    <div>

                        <h4 className="text-sm font-semibold text-gray-800">
                            Basic Authentication
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                            The username and password will be used for HTTP Basic Authentication.
                        </p>

                    </div>


                    <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">

                        {/* Username */}

                        <div>

                            <label
                                htmlFor="basic-username"
                                className="block text-xs font-medium text-gray-700"
                            >
                                Username
                            </label>


                            <input
                                id="basic-username"
                                type="text"
                                value={
                                    draft.username
                                }
                                onChange={(event) =>
                                    updateAuthorization({
                                        username:
                                            event.target.value,
                                    })
                                }
                                placeholder="Username"
                                autoComplete="off"
                                className="
                                    mt-1
                                    h-10
                                    w-full
                                    rounded-md
                                    border
                                    border-gray-300
                                    px-3
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                        </div>


                        {/* Password */}

                        <div>

                            <label
                                htmlFor="basic-password"
                                className="block text-xs font-medium text-gray-700"
                            >
                                Password
                            </label>


                            <div className="relative mt-1">

                                <input
                                    id="basic-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        draft.password
                                    }
                                    onChange={(event) =>
                                        updateAuthorization({
                                            password:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    className="
                                        h-10
                                        w-full
                                        rounded-md
                                        border
                                        border-gray-300
                                        px-3
                                        pr-20
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    className="
                                        absolute
                                        right-2
                                        top-1/2
                                        -translate-y-1/2
                                        rounded
                                        px-2
                                        py-1
                                        text-xs
                                        text-gray-500
                                        hover:bg-gray-100
                                        hover:text-gray-800
                                    "
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"
                                    }
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
                API Key
            ================================== */}

            {draft.authType === "API_KEY" && (

                <div className="rounded-lg border bg-white p-5">

                    <div>

                        <h4 className="text-sm font-semibold text-gray-800">
                            API Key
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                            Configure the API key name, value, and where it should be sent.
                        </p>

                    </div>


                    <div className="mt-4 grid max-w-2xl gap-4">

                        {/* Key Name */}

                        <div>

                            <label
                                htmlFor="api-key-name"
                                className="block text-xs font-medium text-gray-700"
                            >
                                Key Name
                            </label>


                            <input
                                id="api-key-name"
                                type="text"
                                value={
                                    draft.apiKeyName
                                }
                                onChange={(event) =>
                                    updateAuthorization({
                                        apiKeyName:
                                            event.target.value,
                                    })
                                }
                                placeholder="X-API-Key"
                                autoComplete="off"
                                className="
                                    mt-1
                                    h-10
                                    w-full
                                    rounded-md
                                    border
                                    border-gray-300
                                    px-3
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                        </div>


                        {/* API Key */}

                        <div>

                            <label
                                htmlFor="api-key"
                                className="block text-xs font-medium text-gray-700"
                            >
                                API Key
                            </label>


                            <div className="relative mt-1">

                                <input
                                    id="api-key"
                                    type={
                                        showApiKey
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        draft.apiKey
                                    }
                                    onChange={(event) =>
                                        updateAuthorization({
                                            apiKey:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Enter API key"
                                    autoComplete="off"
                                    className="
                                        h-10
                                        w-full
                                        rounded-md
                                        border
                                        border-gray-300
                                        px-3
                                        pr-20
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowApiKey(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    className="
                                        absolute
                                        right-2
                                        top-1/2
                                        -translate-y-1/2
                                        rounded
                                        px-2
                                        py-1
                                        text-xs
                                        text-gray-500
                                        hover:bg-gray-100
                                        hover:text-gray-800
                                    "
                                >
                                    {showApiKey
                                        ? "Hide"
                                        : "Show"
                                    }
                                </button>

                            </div>

                        </div>


                        {/* Location */}

                        <div>

                            <label
                                htmlFor="api-key-location"
                                className="block text-xs font-medium text-gray-700"
                            >
                                Add To
                            </label>


                            <select
                                id="api-key-location"
                                value={
                                    draft.apiKeyLocation
                                }
                                onChange={(event) =>
                                    updateAuthorization({
                                        apiKeyLocation:
                                            event.target.value,
                                    })
                                }
                                className="
                                    mt-1
                                    h-10
                                    w-full
                                    rounded-md
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            >

                                <option value="HEADER">
                                    Header
                                </option>

                                <option value="QUERY">
                                    Query Parameter
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
                Security Note
            ================================== */}

            {draft.authType !== "NONE" && (

                <div className="rounded-md border border-blue-100 bg-blue-50 p-3">

                    <p className="text-xs text-blue-700">

                        Authentication changes are stored as
                        unsaved request changes. Click the main
                        <strong> Save </strong>
                        button to persist them.

                    </p>

                </div>

            )}

        </div>
    );
}