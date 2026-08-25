import { useState, useEffect } from "react";

import { useHistoryStore } from "../../store/HistoryStore";

import type {
    HistoryResponse,
} from "@/types/history";

import ExecutionHistoryDetail
    from "./executionHistoryDetail";


// ==========================================
// Props
// ==========================================

interface HistoryPanelProps {

    workspaceId: number;

    collectionId: number;

    requestId: number;
}


// ==========================================
// Helpers
// ==========================================

function getStatusClass(
    statusCode: number
): string {

    if (statusCode >= 200 && statusCode < 300) {
        return "text-green-600";
    }

    if (statusCode >= 300 && statusCode < 400) {
        return "text-yellow-600";
    }

    if (statusCode >= 400 && statusCode < 500) {
        return "text-orange-600";
    }

    if (statusCode >= 500) {
        return "text-red-600";
    }

    return "text-gray-600";
}


function formatDate(
    value: string
): string {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}


// ==========================================
// History Panel
// ==========================================

export default function HistoryPanel({
    workspaceId,
    collectionId,
    requestId,
}: HistoryPanelProps) {

    const [
        selectedHistory,
        setSelectedHistory,
    ] = useState<HistoryResponse | null>(null);

    const [
        actionError,
        setActionError,
    ] = useState<string | null>(null);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

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

    }, [
        requestId,
        collectionId,
    ]);


    // ==========================================
    // Clear All History
    // ==========================================

    const handleClearHistory = async () => {

        if (history.length === 0) {
            return;
        }


        const confirmed =
            window.confirm(
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

        } catch (error) {

            console.error(
                "Failed to clear history:",
                error
            );

            setActionError(
                "Failed to clear execution history."
            );

        } finally {

            setActionLoading(false);

        }

    };


    // ==========================================
    // Delete One History Entry
    // ==========================================

    const handleDeleteHistory = async (
        historyId: number
    ) => {

        const confirmed =
            window.confirm(
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


            if (
                selectedHistory?.id ===
                historyId
            ) {

                setSelectedHistory(null);

            }

        } catch (error) {

            console.error(
                "Failed to delete history:",
                error
            );

            setActionError(
                "Failed to delete execution history."
            );

        } finally {

            setActionLoading(false);

        }

    };


    return (

        <section
            className="
                flex
                h-full
                min-h-0
                flex-col
                border-t
                bg-white
            "
        >

            {/* ==================================
                Header
            ================================== */}

            <div
                className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    gap-4
                    border-b
                    px-5
                    py-3
                "
            >

                {/* Title */}

                <div>

                    <h2
                        className="
                            text-sm
                            font-semibold
                            text-gray-800
                        "
                    >
                        Execution History
                    </h2>

                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-gray-500
                        "
                    >
                        Previous executions of this request
                    </p>

                </div>


                {/* Header Actions */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    {/* Clear History */}

                    {history.length > 0 && (

                        <button
                            type="button"
                            onClick={
                                handleClearHistory
                            }
                            disabled={loading || actionLoading}
                            className="
                                rounded-md
                                border
                                border-red-200
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-red-600
                                hover:bg-red-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Clear History

                            {actionLoading
                                ? "Clearing..."
                                : "Clear History"
                            }
                        </button>

                    )}


                    {/* Count */}

                    {!loading &&
                        history.length > 0 && (

                            <span
                                className="
                                    rounded-full
                                    bg-gray-100
                                    px-2
                                    py-1
                                    text-xs
                                    text-gray-600
                                "
                            >
                                {history.length}
                            </span>

                        )}

                </div>

            </div>


            {/* ==================================
                Content
            ================================== */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                "
            >

                {/* ==================================
                    Loading
                ================================== */}

                {loading && (

                    <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            p-6
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            Loading execution history...
                        </p>

                    </div>

                )}


                {/* ==================================
                    Error
                ================================== */}

                {!loading && error && (

                    <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            p-6
                        "
                    >

                        <div className="text-center">

                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-red-600
                                "
                            >
                                Failed to load execution history.
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                "
                            >
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
                                className="
                                    mt-3
                                    rounded-md
                                    bg-gray-900
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-medium
                                    text-white
                                    hover:bg-gray-800
                                "
                            >
                                Retry
                            </button>

                        </div>

                    </div>

                )}


                {/* ==================================
                    Empty
                ================================== */}

                {!loading &&
                    !error &&
                    history.length === 0 && (

                        <div
                            className="
                                flex
                                h-full
                                items-center
                                justify-center
                                p-6
                            "
                        >

                            <div
                                className="
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mb-2
                                        text-2xl
                                    "
                                >
                                    ◷
                                </div>


                                <h3
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    No execution history
                                </h3>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    Send this request to
                                    create your first
                                    history entry.
                                </p>

                            </div>

                        </div>

                    )}


                {/* ==================================
                    History List
                ================================== */}

                {!loading &&
                    !error &&
                    history.length > 0 && (

                        <div>

                            {history.map((item) => (

                                <div
                                    key={item.id}
                                    className="
                                        border-b
                                        px-5
                                        py-4
                                        transition
                                        hover:bg-gray-50
                                    "
                                >

                                    {/* ==================================
                                        Top Row
                                    ================================== */}

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                        "
                                    >

                                        {/* Clickable Details */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedHistory(
                                                    item
                                                )
                                            }
                                            className="
                                                flex
                                                min-w-0
                                                flex-1
                                                items-center
                                                gap-3
                                                text-left
                                            "
                                        >

                                            {/* Status */}

                                            <span
                                                className={`
                                                    shrink-0
                                                    text-sm
                                                    font-bold
                                                    ${getStatusClass(
                                                        item.statusCode
                                                    )}
                                                `}
                                            >
                                                {item.statusCode}
                                            </span>


                                            {/* Response Time */}

                                            <span
                                                className="
                                                    shrink-0
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                {item.responseTime} ms
                                            </span>


                                            {/* Date */}

                                            <span
                                                className="
                                                    truncate
                                                    text-xs
                                                    text-gray-400
                                                "
                                            >
                                                {formatDate(
                                                    item.executedAt
                                                )}
                                            </span>

                                        </button>


                                        {/* Delete */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteHistory(
                                                    item.id
                                                )
                                            }
                                            disabled={loading || actionLoading}
                                            className="
                                                shrink-0
                                                rounded-md
                                                px-2
                                                py-1
                                                text-xs
                                                text-red-500
                                                hover:bg-red-50
                                                hover:text-red-700
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            Delete
                                        </button>

                                    </div>


                                    {/* ==================================
                                        Response Body Preview
                                    ================================== */}

                                    {item.responseBody && (

                                        <pre
                                            className="
                                                mt-3
                                                max-h-32
                                                overflow-auto
                                                rounded-md
                                                bg-gray-50
                                                p-3
                                                text-xs
                                                text-gray-700
                                            "
                                        >
                                            {item.responseBody}
                                        </pre>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}

            </div>

            {actionError && (

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        gap-3
                        border-b
                        bg-red-50
                        px-5
                        py-2
                    "
                >

                    <p
                        className="
                            text-xs
                            font-medium
                            text-red-600
                        "
                    >
                        {actionError}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setActionError(null)
                        }
                        className="
                            text-xs
                            text-red-500
                            hover:text-red-700
                        "
                    >
                        Dismiss
                    </button>

                </div>

            )}


            {/* ==================================
                Execution Detail Modal
            ================================== */}

            {selectedHistory && (

                <ExecutionHistoryDetail
                    history={selectedHistory}
                    onClose={() =>
                        setSelectedHistory(null)
                    }
                />

            )}

        </section>
    );
}