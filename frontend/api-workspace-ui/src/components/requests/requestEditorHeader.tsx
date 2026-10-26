
import type { ChangeEvent } from "react";
import { useState } from "react";
import { Check, Pencil, Save, Send } from "lucide-react";
import type { RequestDetail, HttpMethod } from "../../types/request";
import { useRequestStore } from "../../store/RequestStore";
import { useParams } from "react-router-dom";
import { useExecutionStore } from "../../store/ExecutionStore";
import EnvironmentSelector from "../environment/environmentSelector";
import { useEnvironmentStore } from "@/store/EnvironmentStore";
import { resolveEnvironmentVariables, findUnresolvedVariables } from "../../utils/environmentResolver";
import EnvironmentVariablePreview from "../environment/environmentVariablePreview";
import RequestMetadataEditor from "./requestMetaDataEditor";
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

const methodStyles: Record<HttpMethod, string> = {
    GET: "bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-400",
    POST: "bg-violet-50 text-violet-700 border-violet-200 focus:border-violet-400",
    PUT: "bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-400",
    PATCH: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 focus:border-fuchsia-400",
    DELETE: "bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-400",
    HEAD: "bg-slate-50 text-slate-600 border-slate-200 focus:border-slate-400",
    OPTIONS: "bg-indigo-50 text-indigo-700 border-indigo-200 focus:border-indigo-400",
};

export default function RequestEditorHeader({
    request,
}: RequestEditorHeaderProps) {
    const {
        executeRequest,
        loading: executionLoading,
    } = useExecutionStore();

    const [metadataEditorOpen, setMetadataEditorOpen] = useState(false);

    const {
        updateRequestDraft,
        hasUnsavedChanges,
        selectedRequest,
        saving,
        saveRequest,
    } = useRequestStore();

    const { workspaceId } = useParams();

    const { selectedEnvironment, variables } = useEnvironmentStore();
    const { fetchHistory } = useHistoryStore();

    const handleMethodChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {
        updateRequestDraft({
            method: event.target.value as HttpMethod,
        });
    };

    const handleUrlChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        updateRequestDraft({
            url: event.target.value,
        });
    };

    const handleSave = async () => {
        if (!workspaceId || !selectedRequest) return;

        const workspaceIdNumber = Number(workspaceId);

        if (Number.isNaN(workspaceIdNumber)) {
            window.alert("Invalid workspace.");
            return;
        }

        try {
            await saveRequest(
                workspaceIdNumber,
                selectedRequest.collection.id
            );
        } catch (error) {
            console.error("Save request failed:", error);
            window.alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save request."
            );
        }
    };

    const handleSend = async () => {
        if (!selectedRequest) {
            window.alert("Select a request first.");
            return;
        }

        if (!workspaceId) {
            window.alert("Workspace ID is missing.");
            return;
        }

        const workspaceIdNumber = Number(workspaceId);

        if (Number.isNaN(workspaceIdNumber)) {
            window.alert("Invalid workspace ID.");
            return;
        }

        if (!selectedEnvironment) {
            window.alert("Select an environment before sending.");
            return;
        }

        const urlError = validateRequestUrl(selectedRequest.url);

        if (urlError) {
            window.alert(urlError);
            return;
        }

        try {
            await executeRequest(
                workspaceIdNumber,
                selectedRequest.collection.id,
                selectedRequest.id,
                selectedEnvironment.id
            );

            await fetchHistory(
                workspaceIdNumber,
                selectedRequest.collection.id,
                selectedRequest.id
            );
        } catch (error) {
            console.error("Request execution failed:", error);
        }
    };

    const resolvedUrl = selectedRequest
        ? resolveEnvironmentVariables(selectedRequest.url, variables)
        : "";

    const unresolvedVariables = selectedRequest
        ? findUnresolvedVariables(selectedRequest.url, variables)
        : [];

    return (
        <>
            <div className="min-w-0 shrink-0 border-b border-[#e8ddf5] bg-[#f8f6fc]">
                {/* Request title and save controls */}
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[#ece3f5] bg-white px-4 py-3 sm:px-5">
                    <div className="min-w-0 flex-1">
                        <h1
                            className="truncate text-base font-semibold text-[#35105f] sm:text-lg"
                            title={request.name}
                        >
                            {request.name}
                        </h1>

                        {request.description && (
                            <p
                                className="mt-0.5 truncate text-xs text-[#9685a6]"
                                title={request.description}
                            >
                                {request.description}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span
                            className={`whitespace-nowrap text-xs ${
                                hasUnsavedChanges
                                    ? "font-medium text-amber-600"
                                    : "text-emerald-600"
                            }`}
                        >
                            {hasUnsavedChanges ? (
                                "Unsaved changes"
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    <Check size={13} />
                                    Saved
                                </span>
                            )}
                        </span>

                        <button
                            type="button"
                            onClick={() => setMetadataEditorOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4d5f3] bg-white px-3 py-2 text-xs font-medium text-[#654c79] transition hover:border-violet-300 hover:bg-violet-50"
                        >
                            <Pencil size={13} />
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !hasUnsavedChanges}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-600/15 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Save size={13} />
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>

                {/* Method, URL, environment and Send */}
                <div className="flex min-w-0 flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
                    <select
                        value={request.method}
                        onChange={handleMethodChange}
                        aria-label="HTTP method"
                        className={`h-10 w-24 shrink-0 rounded-lg border px-2 text-sm font-bold outline-none transition focus:ring-2 focus:ring-violet-100 ${methodStyles[request.method]}`}
                    >
                        {HTTP_METHODS.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        value={request.url}
                        onChange={handleUrlChange}
                        placeholder="https://api.example.com/users"
                        aria-label="Request URL"
                        className="h-10 min-w-[140px] flex-1 rounded-lg border border-[#e4d5f3] bg-white px-3 text-sm text-[#352443] outline-none transition placeholder:text-[#b2a4bf] focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />

                    <div className="min-w-0 max-w-full shrink-0">
                        <EnvironmentSelector />
                    </div>

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={executionLoading || !selectedEnvironment || !selectedRequest}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={14} />
                        {executionLoading ? "Sending..." : "Send"}
                    </button>
                </div>

                {/* Resolved environment-variable preview */}
                {selectedEnvironment && (
                    <div className="min-w-0 bg-[#f8f6fc] px-4 pb-3 sm:px-5">
                        <EnvironmentVariablePreview
                            originalValue={request.url}
                            resolvedValue={resolvedUrl}
                            unresolvedVariables={unresolvedVariables}
                        />
                    </div>
                )}
            </div>

            {metadataEditorOpen && (
                <RequestMetadataEditor
                    workspaceId={Number(workspaceId)}
                    onClose={() => setMetadataEditorOpen(false)}
                />
            )}
        </>
    );
}
