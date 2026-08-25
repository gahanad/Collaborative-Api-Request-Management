import type { ChangeEvent } from "react";

import type {
    RequestDetail,
    HttpMethod,
} from "../../types/request";

import { useRequestStore } from "../../store/RequestStore";
import { useParams } from "react-router-dom";
import { useExecutionStore } from "../../store/ExecutionStore";
import EnvironmentSelector
    from "../environment/environmentSelector";
import { useEnvironmentStore } from "@/store/EnvironmentStore";
import {
    resolveEnvironmentVariables
} from "../../utils/environmentResolver";
import {
    findUnresolvedVariables
} from "../../utils/environmentResolver";
import EnvironmentVariablePreview
    from "../environment/environmentVariablePreview";
import RequestMetadataEditor
    from "./requestMetaDataEditor";
import {useState} from "react";
import { validateRequestUrl } from "@/utils/requestValidation";
import { useHistoryStore } from "@/store/HistoryStore";


interface RequestEditorHeaderProps {
    request: RequestDetail;
}


const HTTP_METHODS: HttpMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
];


function getMethodClass(
    method: HttpMethod
): string {

    switch (method) {

        case "GET":
            return "text-green-600";

        case "POST":
            return "text-blue-600";

        case "PUT":
            return "text-orange-600";

        case "PATCH":
            return "text-purple-600";

        case "DELETE":
            return "text-red-600";

        case "HEAD":
            return "text-gray-600";

        case "OPTIONS":
            return "text-gray-600";

        default:
            return "text-gray-700";
    }
}


export default function RequestEditorHeader({
    request,
}: RequestEditorHeaderProps) {
    const {
        executeRequest,
        loading: executionLoading,
    } = useExecutionStore();

    const [
        metadataEditorOpen,
        setMetadataEditorOpen,
    ] = useState(false);
    const {
        updateRequestDraft,
        hasUnsavedChanges,
        selectedRequest,
        saving,
        saveRequest,
    } = useRequestStore();
    const { workspaceId } = useParams();

    // ==================================
    // Method Change
    // ==================================

    const handleMethodChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {

        const method =
            event.target.value as HttpMethod;

        updateRequestDraft({
            method,
        });

    };


    // ==================================
    // URL Change
    // ==================================

    const handleUrlChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {

        updateRequestDraft({
            url: event.target.value,
        });

    };

    const handleSave = async () => {

        if (!workspaceId || !selectedRequest) {
            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (Number.isNaN(workspaceIdNumber)) {

            window.alert(
                "Invalid workspace."
            );

            return;
        }


        try {

            await saveRequest(
                workspaceIdNumber,
                selectedRequest.collection.id
            );


        } catch (error) {

            console.error(
                "Save request failed:",
                error
            );

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save request."
            );

        }

    };
    const {
        selectedEnvironment,
        variables
    } = useEnvironmentStore();
    const {
        fetchHistory,
    } = useHistoryStore();
    // const selectedEnvironmentId =
    //     selectedEnvironment?.id;

    console.log("SEND DEBUG:", {
            request,
            selectedRequest,
            selectedEnvironment,
            executionLoading,
            workspaceId,
        });
    const handleSend = async () => {

        // ==========================================
        // Request check
        // ==========================================

        if (!selectedRequest) {

            console.error(
                "No request selected"
            );

            return;
        }


        // ==========================================
        // Workspace check
        // ==========================================

        if (!workspaceId) {

            console.error(
                "Workspace ID is missing"
            );

            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (Number.isNaN(workspaceIdNumber)) {

            console.error(
                "Invalid workspace ID"
            );

            return;
        }


        // ==========================================
        // Environment check
        // ==========================================

        if (!selectedEnvironment) {

            console.error(
                "No environment selected"
            );

            return;
        }


        // ==========================================
        // URL validation
        // ==========================================

        const urlError =
            validateRequestUrl(
                selectedRequest.url
            );


        if (urlError) {

            setExecutionError(
                urlError
            );

            return;
        }


        // ==========================================
        // Execute
        // ==========================================

        await executeRequest(

            workspaceIdNumber,

            selectedRequest.collection.id,

            selectedRequest.id,

            selectedEnvironment.id

        );


        // ==========================================
        // Refresh execution history
        // ==========================================

        await fetchHistory(

            workspaceIdNumber,

            selectedRequest.collection.id,

            selectedRequest.id

        );

    };
    const resolvedUrl =
        selectedRequest
            ? resolveEnvironmentVariables(
                selectedRequest.url,
                variables
            )
            : "";

    const unresolvedVariables =
        selectedRequest
            ? findUnresolvedVariables(
                selectedRequest.url,
                variables
            )
            : [];


    return (
        <>

        <div className="shrink-0 border-b bg-white">

            {/* ==================================
                Request Name + Save Status
            ================================== */}

            <div className="flex items-center justify-between gap-4 px-5 py-3">

                {/* Request Name */}

                <div className="min-w-0 flex-1">

                    <h1
                        className="
                            truncate
                            text-lg
                            font-semibold
                            text-gray-900
                        "
                        title={request.name}
                    >
                        {request.name}
                    </h1>


                    {request.description && (

                        <p
                            className="
                                mt-1
                                truncate
                                text-sm
                                text-gray-500
                            "
                            title={request.description}
                        >
                            {request.description}
                        </p>

                    )}

                </div>


                <button
                    type="button"
                    onClick={() =>
                        setMetadataEditorOpen(true)
                    }
                    className="
                        shrink-0
                        rounded-md
                        border
                        border-gray-300
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-gray-700
                        hover:bg-gray-50
                    "
                >
                    Edit
                </button>


                {/* ==================================
                    Save Status + Environment + Send
                ================================== */}

                <div className="flex shrink-0 items-center gap-3">

                    {/* Save Status */}

                    <span
                        className={
                            hasUnsavedChanges
                                ? "text-xs font-medium text-yellow-600"
                                : "text-xs text-gray-400"
                        }
                    >
                        {hasUnsavedChanges
                            ? "Unsaved changes"
                            : "Saved"
                        }
                    </span>


                    {/* Save */}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            saving ||
                            !hasUnsavedChanges
                        }
                        className="
                            shrink-0
                            rounded-md
                            bg-blue-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {saving
                            ? "Saving..."
                            : "Save"
                        }
                    </button>


                    {/* Environment */}

                    <EnvironmentSelector />


                    {/* Send */}

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={
                            executionLoading ||
                            !selectedEnvironment ||
                            !selectedRequest
                        }
                        className="
                            rounded-md
                            bg-blue-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {executionLoading
                            ? "Sending..."
                            : "Send"
                        }
                    </button>

                </div>

            </div>


            {/* ==================================
                Method + URL
            ================================== */}

            <div className="min-w-0 px-5 pb-4">

                {/* ==================================
                    Method + URL Row
                ================================== */}

                <div className="flex min-w-0 items-center gap-2">

                    {/* ==================================
                        HTTP Method
                    ================================== */}

                    <div className="relative shrink-0">

                        <select
                            value={request.method}
                            onChange={handleMethodChange}
                            aria-label="HTTP method"
                            className={`
                                h-12
                                w-24
                                appearance-none
                                rounded-md
                                border
                                border-gray-300
                                bg-gray-50
                                px-3
                                pr-8
                                text-sm
                                font-bold
                                outline-none
                                transition
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                                ${getMethodClass(request.method)}
                            `}
                        >

                            {HTTP_METHODS.map((method) => (

                                <option
                                    key={method}
                                    value={method}
                                >
                                    {method}
                                </option>

                            ))}

                        </select>


                        {/* Dropdown Arrow */}

                        <span
                            className="
                                pointer-events-none
                                absolute
                                right-3
                                top-1/2
                                -translate-y-1/2
                                text-xs
                                text-gray-500
                            "
                        >
                            ▼
                        </span>

                    </div>


                    {/* ==================================
                        URL Input
                    ================================== */}

                    <input
                        type="text"
                        value={request.url}
                        onChange={handleUrlChange}
                        placeholder="https://api.example.com/users"
                        aria-label="Request URL"
                        className="
                            h-12
                            min-w-0
                            flex-1
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-4
                            text-sm
                            text-gray-800
                            outline-none
                            transition
                            placeholder:text-gray-400
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                        "
                    />

                </div>


                {/* ==================================
                    Environment Variable Preview
                ================================== */}

                {selectedEnvironment && (

                    <EnvironmentVariablePreview
                        originalValue={request.url}
                        resolvedValue={resolvedUrl}
                        unresolvedVariables={
                            unresolvedVariables
                        }
                    />

                )}

            </div>

        </div>


        {metadataEditorOpen && (

            <RequestMetadataEditor

                workspaceId={
                    Number(workspaceId)
                }

                onClose={() =>
                    setMetadataEditorOpen(false)
                }

            />

        )}

    </>
);
}

function setExecutionError(urlError: string) {
    console.error("Request execution error:", urlError);
    window.alert(urlError);
}
