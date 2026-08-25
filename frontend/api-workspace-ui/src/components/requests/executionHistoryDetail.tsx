import type { HistoryResponse } from "../../types/history";
// import HistoryPanel from "./historyPanel";
// import {useState} from "react";
// import { useHistoryStore } from "@/store/HistoryStore";


// ==========================================
// Props
// ==========================================

interface ExecutionHistoryDetailProps {

    history: HistoryResponse;

    onClose: () => void;
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
// Component
// ==========================================

export default function ExecutionHistoryDetail({
    history,
    onClose,
}: ExecutionHistoryDetailProps) {
    

    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                px-4
                py-6
            "
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="
                    flex
                    max-h-[85vh]
                    w-full
                    max-w-3xl
                    flex-col
                    overflow-hidden
                    rounded-xl
                    bg-white
                    shadow-xl
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
                        border-b
                        px-5
                        py-4
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Execution Details
                        </h2>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            Execution #{history.id}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-md
                            px-2
                            py-1
                            text-xl
                            text-gray-400
                            hover:bg-gray-100
                            hover:text-gray-700
                        "
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                {/* ==================================
                    Content
                ================================== */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        p-5
                    "
                >

                    {/* ==================================
                        Summary
                    ================================== */}

                    <div
                        className="
                            grid
                            grid-cols-3
                            gap-4
                        "
                    >

                        {/* Status */}

                        <div
                            className="
                                rounded-lg
                                border
                                bg-gray-50
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    text-gray-500
                                "
                            >
                                Status
                            </p>

                            <p
                                className={`
                                    mt-1
                                    text-xl
                                    font-bold
                                    ${getStatusClass(
                                        history.statusCode
                                    )}
                                `}
                            >
                                {history.statusCode}
                            </p>

                        </div>


                        {/* Response Time */}

                        <div
                            className="
                                rounded-lg
                                border
                                bg-gray-50
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    text-gray-500
                                "
                            >
                                Response Time
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xl
                                    font-bold
                                    text-gray-800
                                "
                            >
                                {history.responseTime} ms
                            </p>

                        </div>


                        {/* Executed At */}

                        <div
                            className="
                                rounded-lg
                                border
                                bg-gray-50
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    text-gray-500
                                "
                            >
                                Executed At
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    font-medium
                                    text-gray-800
                                "
                            >
                                {formatDate(
                                    history.executedAt
                                )}
                            </p>

                        </div>

                    </div>


                    {/* ==================================
                        Response Body
                    ================================== */}

                    <div className="mt-6">

                        <div
                            className="
                                mb-2
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <h3
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                Response Body
                            </h3>

                        </div>


                        {history.responseBody ? (

                            <pre
                                className="
                                    `max-h-[400px]`
                                    overflow-auto
                                    rounded-lg
                                    border
                                    bg-gray-50
                                    p-4
                                    text-xs
                                    leading-5
                                    text-gray-800
                                "
                            >
                                {history.responseBody}
                            </pre>

                        ) : (

                            <div
                                className="
                                    rounded-lg
                                    border
                                    bg-gray-50
                                    p-4
                                    text-sm
                                    text-gray-500
                                "
                            >
                                No response body.
                            </div>

                        )}

                    </div>

                </div>


                {/* ==================================
                    Footer
                ================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        justify-end
                        border-t
                        px-5
                        py-3
                    "
                >

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-md
                            bg-gray-900
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-gray-800
                        "
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}