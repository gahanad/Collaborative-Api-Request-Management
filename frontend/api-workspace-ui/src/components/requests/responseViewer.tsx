import { useMemo, useState } from "react";

import { useExecutionStore } from "../../store/ExecutionStore";


type ResponseTab = "body" | "headers";

function formatBytes(bytes: number): string {

    if (bytes === 0) {
        return "0 B";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}


function formatResponseTime(
    milliseconds: number
): string {

    if (milliseconds < 1000) {
        return `${milliseconds} ms`;
    }

    return `${(milliseconds / 1000).toFixed(2)} s`;
}


function getStatusText(status: number): string {

    const statusTexts: Record<number, string> = {

        200: "OK",
        201: "Created",
        202: "Accepted",
        204: "No Content",

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

    return statusTexts[status] ?? "Unknown";
}


function getStatusClass(status: number): string {

    if (status >= 200 && status < 300) {
        return "text-green-600";
    }

    if (status >= 300 && status < 400) {
        return "text-yellow-600";
    }

    if (status >= 400 && status < 500) {
        return "text-orange-600";
    }

    if (status >= 500) {
        return "text-red-600";
    }

    return "text-gray-600";
}
export default function ResponseViewer() {

    const {
        response,
        loading,
        error,
    } = useExecutionStore();


    const [activeTab, setActiveTab] =
        useState<ResponseTab>("body");


    // ==========================================
    // Format Response Body
    // ==========================================


    const formattedBody = useMemo(() => {

        if (!response?.body) {
            return "";
        }


        try {

            const parsedBody =
                JSON.parse(response.body);


            return JSON.stringify(
                parsedBody,
                null,
                2
            );

        } catch {

            return response.body;

        }

    }, [response?.body]);


    // ==========================================
    // Nothing Executed
    // ==========================================

    if (!response && !loading && !error) {

        return (
            <section className="flex h-full min-h-0 flex-col border-t bg-white">

                <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
                    <h2 className="text-sm font-semibold text-gray-800">
                        Response
                    </h2>
                </div>


                <div className="flex flex-1 items-center justify-center">

                    <div className="text-center">

                        <div className="mb-3 text-3xl text-gray-300">
                            ⇩
                        </div>

                        <p className="text-sm text-gray-500">
                            Send a request to see the response.
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (
            <section className="flex h-full min-h-0 flex-col border-t bg-white">

                <div className="shrink-0 border-b px-5 py-3">

                    <h2 className="text-sm font-semibold text-gray-800">
                        Response
                    </h2>

                </div>


                <div className="flex flex-1 items-center justify-center">

                    <div className="flex items-center gap-3 text-sm text-gray-500">

                        <div
                            className="
                                h-5
                                w-5
                                animate-spin
                                rounded-full
                                border-2
                                border-gray-300
                                border-t-blue-600
                            "
                        />

                        Sending request...

                    </div>

                </div>

            </section>
        );
    }


    // ==========================================
    // Error
    // ==========================================

    if (error) {

        return (
            <section className="flex h-full min-h-0 flex-col border-t bg-white">

                <div className="shrink-0 border-b px-5 py-3">

                    <h2 className="text-sm font-semibold text-gray-800">
                        Response
                    </h2>

                </div>


                <div className="p-5">

                    <div className="rounded-md border border-red-200 bg-red-50 p-4">

                        <p className="text-sm font-medium text-red-700">
                            Request failed
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-red-600">
                            {error}
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    // ==========================================
    // Successful Response
    // ==========================================

    if (!response) {
        return null;
    }
    return (

        <section className="flex h-full min-h-0 flex-col border-t bg-white">

            {/* ==================================
                Response Header
            ================================== */}

            <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">

                <h2 className="text-sm font-semibold text-gray-800">
                    Response
                </h2>

                <div className="flex items-center gap-4 text-xs">

                    <span
                        className={`font-semibold ${getStatusClass(
                            response.status
                        )}`}
                    >
                        {response.status}{" "}
                        {getStatusText(response.status)}
                    </span>

                    <span className="text-gray-500">
                        {formatResponseTime(
                            response.responseTime
                        )}
                    </span>

                    <span className="text-gray-500">
                        {formatBytes(
                            response.size
                        )}
                    </span>

                </div>

            </div>


            {/* ==================================
                Response Tabs
            ================================== */}

            <div className="flex shrink-0 items-center border-b px-4">

                <button
                    type="button"
                    onClick={() =>
                        setActiveTab("body")
                    }
                    className={`
                        border-b-2
                        px-4
                        py-2
                        text-sm
                        font-medium
                        ${
                            activeTab === "body"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }
                    `}
                >
                    Body
                </button>


                <button
                    type="button"
                    onClick={() =>
                        setActiveTab("headers")
                    }
                    className={`
                        border-b-2
                        px-4
                        py-2
                        text-sm
                        font-medium
                        ${
                            activeTab === "headers"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }
                    `}
                >
                    Headers
                </button>

            </div>


            {/* ==================================
                Response Content
            ================================== */}

            <div className="min-h-0 flex-1 overflow-auto">

                {activeTab === "body" && (

                    <pre
                        className="
                            min-h-full
                            whitespace-pre-wrap
                            break-words
                            bg-gray-50
                            p-5
                            font-mono
                            text-sm
                            leading-6
                            text-gray-800
                        "
                    >
                        {formattedBody}
                    </pre>

                )}


                {activeTab === "headers" && (

                    <div className="p-5">

                        {!response?.headers ||
                        Object.keys(response.headers).length === 0 ? (

                            <div className="text-sm text-gray-500">
                                No response headers.
                            </div>

                        ) : (

                            <div className="overflow-hidden rounded-md border">

                                {Object.entries(
                                    response.headers
                                ).map(
                                    ([name, values]) => (

                                        <div
                                            key={name}
                                            className="grid grid-cols-[220px_1fr] border-b last:border-b-0"
                                        >

                                            {/* Header Name */}

                                            <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">

                                                {name}

                                            </div>


                                            {/* Header Value */}

                                            <div className="px-4 py-3 font-mono text-sm text-gray-800">

                                                {Array.isArray(values)
                                                    ? values.join(", ")
                                                    : values}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                )}

            </div>

        </section>
    );
}