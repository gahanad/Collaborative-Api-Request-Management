
import { useMemo, useState } from "react";
import {
    Check,
    Clock3,
    Copy,
    Download,
    FileText,
} from "lucide-react";

import { useExecutionStore } from "../../store/ExecutionStore";

type ResponseTab = "body" | "headers";

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatResponseTime(milliseconds: number): string {
    return milliseconds < 1000
        ? `${milliseconds} ms`
        : `${(milliseconds / 1000).toFixed(2)} s`;
}

function getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
        200: "OK",
        201: "Created",
        202: "Accepted",
        204: "No Content",
        301: "Moved Permanently",
        302: "Found",
        304: "Not Modified",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
    };

    return statusTexts[status] ?? "HTTP Response";
}

function getStatusClass(status: number): string {
    if (status >= 200 && status < 300) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (status >= 300 && status < 400) {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
    if (status >= 400 && status < 500) {
        return "border-orange-200 bg-orange-50 text-orange-700";
    }
    if (status >= 500) {
        return "border-rose-200 bg-rose-50 text-rose-700";
    }
    return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function ResponseViewer() {
    const { response, loading, error } = useExecutionStore();

    const [activeTab, setActiveTab] = useState<ResponseTab>("body");
    const [copied, setCopied] = useState(false);

    const formattedBody = useMemo(() => {
        if (response?.body == null || response.body === "") {
            return "";
        }

        try {
            return JSON.stringify(JSON.parse(response.body), null, 2);
        } catch {
            return response.body;
        }
    }, [response?.body]);

    const copyResponse = async () => {
        try {
            await navigator.clipboard.writeText(formattedBody);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (copyError) {
            console.error("Unable to copy response:", copyError);
        }
    };

    const downloadResponse = () => {
        const blob = new Blob([formattedBody], {
            type: "application/json;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "response.json";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
            {/* Response summary */}
            <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-[#eee7f5] bg-white px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <h2 className="shrink-0 text-sm font-semibold tracking-tight text-[#35105f]">
                        Response
                    </h2>

                    {response && !loading && !error && (
                        <span
                            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${getStatusClass(response.status)}`}
                        >
                            {response.status} {getStatusText(response.status)}
                        </span>
                    )}
                </div>

                {response && !loading && !error && (
                    <div className="flex shrink-0 items-center gap-3 text-xs text-[#877994]">
                        <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={13} className="text-violet-500" />
                            {formatResponseTime(response.responseTime)}
                        </span>

                        <span className="rounded-md bg-[#f7f3fc] px-2 py-1 font-medium text-[#654c79]">
                            {formatBytes(response.size)}
                        </span>
                    </div>
                )}
            </header>

            {/* Response tabs and tools */}
            {response && !loading && !error && (
                <div className="flex shrink-0 items-center justify-between border-b border-[#eee7f5] bg-white px-3">
                    <div className="flex items-center gap-1">
                        {(["body", "headers"] as ResponseTab[]).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition ${
                                    activeTab === tab
                                        ? "border-violet-600 text-violet-700"
                                        : "border-transparent text-[#877994] hover:text-violet-700"
                                }`}
                            >
                                {tab === "body" ? "Body" : "Headers"}

                                {tab === "headers" && response.headers
                                    ? ` (${Object.keys(response.headers).length})`
                                    : ""}
                            </button>
                        ))}
                    </div>

                    {activeTab === "body" && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={copyResponse}
                                title="Copy response body"
                                aria-label="Copy response body"
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#877994] transition hover:bg-violet-50 hover:text-violet-700"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copied" : "Copy"}
                            </button>

                            <button
                                type="button"
                                onClick={downloadResponse}
                                title="Download response body"
                                aria-label="Download response body"
                                className="rounded-lg p-2 text-[#877994] transition hover:bg-violet-50 hover:text-violet-700"
                            >
                                <Download size={15} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable response content */}
            <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
                {loading ? (
                    <div className="flex h-full min-h-32 items-center justify-center gap-3 text-sm text-[#877994]">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                        Sending request...
                    </div>
                ) : error ? (
                    <div className="p-4">
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                            <p className="text-sm font-semibold text-rose-700">
                                Request failed
                            </p>
                            <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-rose-600">
                                {error}
                            </pre>
                        </div>
                    </div>
                ) : !response ? (
                    <div className="flex h-full min-h-32 items-center justify-center p-5">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50">
                                <FileText size={22} className="text-violet-500" />
                            </div>

                            <p className="text-sm font-semibold text-[#49315f]">
                                No response yet
                            </p>

                            <p className="mt-1 text-xs text-[#9685a6]">
                                Send a request to inspect its response.
                            </p>
                        </div>
                    </div>
                ) : activeTab === "body" ? (
                    <pre className="min-h-full min-w-0 whitespace-pre-wrap break-words bg-[#fbfaff] p-4 font-mono text-[13px] leading-6 text-[#352443] sm:p-5">
                        {formattedBody || "(empty response body)"}
                    </pre>
                ) : (
                    <div className="min-w-0 p-3 sm:p-4">
                        {!response.headers ||
                        Object.keys(response.headers).length === 0 ? (
                            <p className="p-3 text-sm text-[#877994]">
                                No response headers.
                            </p>
                        ) : (
                            <div className="min-w-0 overflow-hidden rounded-xl border border-[#eee5f5]">
                                {Object.entries(response.headers).map(
                                    ([name, values]) => (
                                        <div
                                            key={name}
                                            className="grid min-w-0 grid-cols-1 border-b border-[#f0e9f6] last:border-b-0 sm:grid-cols-[minmax(120px,0.8fr)_minmax(0,2fr)]"
                                        >
                                            <div className="break-words bg-[#faf8fd] px-3 py-2.5 text-xs font-semibold text-[#654c79] sm:px-4">
                                                {name}
                                            </div>

                                            <div className="min-w-0 break-words px-3 py-2.5 font-mono text-xs leading-5 text-[#51435f] sm:px-4">
                                                {Array.isArray(values)
                                                    ? values.join(", ")
                                                    : values}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
