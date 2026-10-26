
import { useEffect, useState } from "react";
import { Clock3, Trash2, X } from "lucide-react";

import { useHistoryStore } from "../../store/HistoryStore";
import type { HistoryResponse } from "@/types/history";
import ExecutionHistoryDetail from "./executionHistoryDetail";

interface HistoryPanelProps {
    workspaceId: number;
    collectionId: number;
    requestId: number;
}

function getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
        return "text-emerald-700 bg-emerald-50";
    }

    if (statusCode >= 300 && statusCode < 400) {
        return "text-amber-700 bg-amber-50";
    }

    if (statusCode >= 400 && statusCode < 500) {
        return "text-orange-700 bg-orange-50";
    }

    if (statusCode >= 500) {
        return "text-rose-700 bg-rose-50";
    }

    return "text-gray-600 bg-gray-50";
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

export default function HistoryPanel({
    workspaceId,
    collectionId,
    requestId,
}: HistoryPanelProps) {
    const [selectedHistory, setSelectedHistory] =
        useState<HistoryResponse | null>(null);

    const [actionError, setActionError] =
        useState<string | null>(null);

    const [actionLoading, setActionLoading] =
        useState(false);

    const {
        history,
        loading,
        error,
        fetchHistory,
        deleteHistory,
        clearHistory,
    } = useHistoryStore();

    useEffect(() => {
        setSelectedHistory(null);
        setActionError(null);
    }, [requestId, collectionId]);

    const handleClearHistory = async () => {
        if (history.length === 0 || actionLoading) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete all execution history for this request?"
        );

        if (!confirmed) {
            return;
        }

        setActionError(null);

        try {
            setActionLoading(true);

            await clearHistory(
                workspaceId,
                collectionId,
                requestId
            );

            setSelectedHistory(null);
        } catch (err) {
            console.error("Failed to clear history:", err);
            setActionError("Failed to clear execution history.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteHistory = async (historyId: number) => {
        if (actionLoading) {
            return;
        }

        const confirmed = window.confirm(
            "Delete this execution history entry?"
        );

        if (!confirmed) {
            return;
        }

        setActionError(null);

        try {
            setActionLoading(true);

            await deleteHistory(
                workspaceId,
                collectionId,
                requestId,
                historyId
            );

            if (selectedHistory?.id === historyId) {
                setSelectedHistory(null);
            }
        } catch (err) {
            console.error("Failed to delete history:", err);
            setActionError("Failed to delete execution history.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
            {/* Fixed history header */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#eee5f5] bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <Clock3 size={16} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-[#35105f]">
                            Execution History
                        </h2>
                        <p className="text-xs text-[#9685a6]">
                            Previous executions
                        </p>
                    </div>

                    {!loading && history.length > 0 && (
                        <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                            {history.length}
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {history.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearHistory}
                            disabled={loading || actionLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                        >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">
                                {actionLoading ? "Clearing..." : "Clear history"}
                            </span>
                            <span className="sm:hidden">Clear</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Independently scrollable history content */}
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
                {loading && (
                    <div className="flex min-h-24 items-center justify-center p-5">
                        <p className="text-sm text-[#877994]">
                            Loading execution history...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="m-3 rounded-lg border border-rose-100 bg-rose-50 p-4">
                        <p className="text-sm font-medium text-rose-700">
                            Failed to load execution history
                        </p>
                        <p className="mt-1 break-words text-xs text-rose-600">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={() =>
                                fetchHistory(
                                    workspaceId,
                                    collectionId,
                                    requestId
                                )
                            }
                            className="mt-3 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && history.length === 0 && (
                    <div className="flex min-h-24 items-center justify-center p-4">
                        <div className="text-center">
                            <Clock3
                                size={22}
                                className="mx-auto mb-2 text-violet-300"
                            />
                            <p className="text-sm font-medium text-[#654c79]">
                                No execution history
                            </p>
                            <p className="mt-1 text-xs text-[#9685a6]">
                                Send this request to create your first entry.
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && history.length > 0 && (
                    <div className="divide-y divide-[#f0e9f6]">
                        {history.map((item) => (
                            <article
                                key={item.id}
                                className="min-w-0 px-4 py-3 transition hover:bg-[#fcfaff]"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedHistory(item)}
                                        className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
                                        title="View execution details"
                                    >
                                        <span
                                            className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${getStatusClass(item.statusCode)}`}
                                        >
                                            {item.statusCode}
                                        </span>

                                        <span className="shrink-0 text-xs font-medium text-[#654c79]">
                                            {item.responseTime} ms
                                        </span>

                                        <span className="min-w-0 break-words text-xs text-[#9685a6]">
                                            {formatDate(item.executedAt)}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteHistory(item.id)
                                        }
                                        disabled={loading || actionLoading}
                                        title="Delete history entry"
                                        aria-label="Delete history entry"
                                        className="shrink-0 rounded-md p-1.5 text-[#a293b0] transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {item.responseBody && (
                                    <pre className="mt-3 max-h-32 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[#eee5f5] bg-[#faf8fd] p-3 font-mono text-xs leading-5 text-[#51435f]">
                                        {item.responseBody}
                                    </pre>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Action feedback */}
            {actionError && (
                <div className="flex shrink-0 items-start justify-between gap-3 border-t border-rose-100 bg-rose-50 px-4 py-2">
                    <p className="break-words text-xs text-rose-700">
                        {actionError}
                    </p>
                    <button
                        type="button"
                        onClick={() => setActionError(null)}
                        aria-label="Dismiss error"
                        className="shrink-0 rounded p-1 text-rose-500 hover:bg-rose-100"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Execution detail modal */}
            {selectedHistory && (
                <ExecutionHistoryDetail
                    history={selectedHistory}
                    onClose={() => setSelectedHistory(null)}
                />
            )}
        </section>
    );
}
