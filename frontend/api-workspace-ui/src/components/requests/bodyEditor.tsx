import { useEffect, useState } from "react";

import { useRequestStore } from "../../store/RequestStore";


type BodyType =
    | "NONE"
    | "JSON"
    | "TEXT";


const EMPTY_BODY = "";


export default function BodyEditor() {

    const {
        selectedRequest,
        updateRequestDraft,
    } = useRequestStore();


    const [
        bodyType,
        setBodyType,
    ] = useState<BodyType>("NONE");


    const [
        body,
        setBody,
    ] = useState<string>(EMPTY_BODY);


    const [
        formatError,
        setFormatError,
    ] = useState<string | null>(null);


    // ==========================================
    // Load body when request changes
    // ==========================================

    useEffect(() => {

        if (!selectedRequest) {

            setBodyType("NONE");

            setBody(EMPTY_BODY);

            setFormatError(null);

            return;
        }


        const existingBody =
            selectedRequest.body;


        if (
            existingBody === null ||
            existingBody.trim() === ""
        ) {

            setBodyType("NONE");

            setBody(EMPTY_BODY);

            setFormatError(null);

            return;
        }


        setBodyType("JSON");

        setBody(existingBody);

        setFormatError(null);

    }, [selectedRequest?.id]);


    // ==========================================
    // No request selected
    // ==========================================

    if (!selectedRequest) {

        return (

            <div className="p-5">

                <div className="rounded-lg border bg-white p-6">

                    <p className="text-sm text-gray-500">
                        Select a request to configure its body.
                    </p>

                </div>

            </div>

        );
    }


    // ==========================================
    // Body Type Change
    // ==========================================

    const handleBodyTypeChange = (
        type: BodyType
    ) => {

        setBodyType(type);

        setFormatError(null);


        if (type === "NONE") {

            setBody(EMPTY_BODY);

            updateRequestDraft({
                body: null,
            });

            return;
        }


        /*
         * When switching from NONE to another body
         * type, keep the existing text if there is any.
         *
         * If no body exists, start with an empty string.
         */

        updateRequestDraft({
            body,
        });

    };


    // ==========================================
    // Body Change
    // ==========================================

    const handleBodyChange = (
        value: string
    ) => {

        setBody(value);

        setFormatError(null);


        if (bodyType === "NONE") {

            return;
        }


        updateRequestDraft({
            body: value,
        });

    };


    // ==========================================
    // Format JSON
    // ==========================================

    const handleFormatJson = () => {

        if (!body.trim()) {

            setFormatError(
                "There is no JSON to format."
            );

            return;
        }


        try {

            const parsed =
                JSON.parse(body);


            const formatted =
                JSON.stringify(
                    parsed,
                    null,
                    2
                );


            setBody(formatted);

            setFormatError(null);


            updateRequestDraft({
                body: formatted,
            });

        } catch {

            setFormatError(
                "Invalid JSON. Please fix the JSON before formatting."
            );

        }
    };


    // ==========================================
    // Clear Body
    // ==========================================

    const handleClearBody = () => {

        setBody("");

        setFormatError(null);

        updateRequestDraft({
            body: null,
        });

    };


    return (

        <div className="flex h-full min-h-0 flex-col">

            {/* ==================================
                Body Header
            ================================== */}

            <div className="shrink-0 border-b bg-white px-5 py-4">

                <div className="flex items-start justify-between gap-4">

                    <div>

                        <h3 className="text-sm font-semibold text-gray-900">
                            Request Body
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            Configure the data sent in the request body.
                        </p>

                    </div>


                    {/* Clear */}

                    {bodyType !== "NONE" && body && (

                        <button
                            type="button"
                            onClick={handleClearBody}
                            className="
                                rounded-md
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-gray-600
                                hover:bg-gray-100
                            "
                        >
                            Clear
                        </button>

                    )}

                </div>


                {/* ==================================
                    Body Type
                ================================== */}

                <div className="mt-4 flex flex-wrap items-center gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            handleBodyTypeChange(
                                "NONE"
                            )
                        }
                        className={`
                            rounded-md
                            border
                            px-4
                            py-2
                            text-xs
                            font-medium
                            transition
                            ${
                                bodyType === "NONE"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                            }
                        `}
                    >
                        No Body
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            handleBodyTypeChange(
                                "JSON"
                            )
                        }
                        className={`
                            rounded-md
                            border
                            px-4
                            py-2
                            text-xs
                            font-medium
                            transition
                            ${
                                bodyType === "JSON"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                            }
                        `}
                    >
                        JSON
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            handleBodyTypeChange(
                                "TEXT"
                            )
                        }
                        className={`
                            rounded-md
                            border
                            px-4
                            py-2
                            text-xs
                            font-medium
                            transition
                            ${
                                bodyType === "TEXT"
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                            }
                        `}
                    >
                        Text
                    </button>

                </div>

            </div>


            {/* ==================================
                No Body
            ================================== */}

            {bodyType === "NONE" && (

                <div className="flex flex-1 items-center justify-center p-5">

                    <div className="max-w-md text-center">

                        <div className="mb-3 text-3xl">
                            ∅
                        </div>


                        <h4 className="text-sm font-semibold text-gray-700">
                            No request body
                        </h4>


                        <p className="mt-1 text-xs text-gray-500">
                            This request will be sent without a body.
                        </p>

                    </div>

                </div>

            )}


            {/* ==================================
                JSON / Text Body
            ================================== */}

            {bodyType !== "NONE" && (

                <div className="flex min-h-0 flex-1 flex-col p-5">

                    {/* Editor Toolbar */}

                    <div className="mb-2 flex shrink-0 items-center justify-between">

                        <div className="flex items-center gap-2">

                            <span className="text-xs font-medium text-gray-500">
                                {bodyType === "JSON"
                                    ? "application/json"
                                    : "text/plain"
                                }
                            </span>

                        </div>


                        {bodyType === "JSON" && (

                            <button
                                type="button"
                                onClick={
                                    handleFormatJson
                                }
                                className="
                                    rounded-md
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-medium
                                    text-gray-600
                                    hover:bg-gray-50
                                "
                            >
                                Format JSON
                            </button>

                        )}

                    </div>


                    {/* Editor */}

                    <textarea
                        value={body}
                        onChange={(event) =>
                            handleBodyChange(
                                event.target.value
                            )
                        }
                        placeholder={
                            bodyType === "JSON"
                                ? '{\n  "key": "value"\n}'
                                : "Enter request body..."
                        }
                        spellCheck={false}
                        className="
                            `min-h-[320px]`
                            flex-1
                            resize-none
                            rounded-lg
                            border
                            border-gray-300
                            bg-gray-950
                            px-4
                            py-4
                            font-mono
                            text-sm
                            leading-6
                            text-gray-100
                            outline-none
                            placeholder:text-gray-500
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                        "
                    />


                    {/* Format Error */}

                    {formatError && (

                        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">

                            <p className="text-xs text-red-600">
                                {formatError}
                            </p>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}