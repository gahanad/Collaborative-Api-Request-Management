import { useState } from "react";

import type {
    CreateRequestRequest,
    HttpMethod
} from "../../types/request";
import { validateRequestName, validateRequestUrl } from "@/utils/requestValidation";

interface NewRequestModalProps {
    open: boolean;

    onClose: () => void;

    onCreate: (
        request: CreateRequestRequest
    ) => Promise<void>;
}


export default function NewRequestModal({
    open,
    onClose,
    onCreate,
}: NewRequestModalProps) {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);
    const [name, setName] =
        useState("New Request");

    const [] =
        useState<HttpMethod>("GET");

    const [url] =
        useState("https://example.com");

    const [description, setDescription] =
        useState("");


    // ==========================================
    // Don't render when closed
    // ==========================================

    if (!open) {
        return null;
    }


    // ==========================================
    // Create Request
    // ==========================================

    const handleCreate = async () => {
        const nameError =
            validateRequestName(name);

        if (nameError) {

            setError(nameError);

            return;

        }


        const urlError =
            validateRequestUrl(url);

        if (urlError) {

            setError(urlError);

            return;

        }

        setError(null);

        const trimmedName =
            name.trim();

        if (!trimmedName) {

            setError(
                "Request name is required."
            );

            return;
        }


        const payload: CreateRequestRequest = {

            name: trimmedName,

            description:
                description.trim() || undefined,

            method: "GET",

            url: "https://example.com",

            body: null,

            authType: "NONE",

        };


        setLoading(true);

        try {

            await onCreate(payload);

            // Reset form after successful creation

            setName("");

            setDescription("");

        } catch (error) {

            console.error(
                "Failed to create request:",
                error
            );

            setError(
                "Failed to create request."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // Render
    // ==========================================

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
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-xl
                    border
                    bg-white
                    shadow-xl
                "
            >

                {/* ==================================
                    Header
                ================================== */}

                <div
                    className="
                        border-b
                        px-5
                        py-4
                    "
                >

                    <h2
                        className="
                            text-base
                            font-semibold
                            text-gray-900
                        "
                    >
                        New Request
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-gray-500
                        "
                    >
                        Create a new API request
                        inside this collection.
                    </p>

                </div>


                {/* ==================================
                    Form
                ================================== */}

                <div
                    className="
                        space-y-4
                        px-5
                        py-5
                    "
                >

                    {/* Request Name */}

                    <div>

                        <label
                            className="
                                mb-1.5
                                block
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            Request Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Get Users"
                            autoFocus
                            disabled={loading}
                            className="
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-gray-500
                                focus:ring-1
                                focus:ring-gray-300
                            "
                        />

                    </div>


                    {/* Description */}

                    <div>

                        <label
                            className="
                                mb-1.5
                                block
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            Description
                            <span
                                className="
                                    ml-1
                                    font-normal
                                    text-gray-400
                                "
                            >
                                (optional)
                            </span>
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            placeholder="What is this request used for?"
                            rows={3}
                            disabled={loading}
                            className="
                                w-full
                                resize-none
                                rounded-md
                                border
                                border-gray-300
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-gray-500
                                focus:ring-1
                                focus:ring-gray-300
                            "
                        />

                    </div>


                    {/* Default Request Info */}

                    <div
                        className="
                            rounded-md
                            bg-gray-50
                            px-3
                            py-2.5
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            New requests start with
                            <span
                                className="
                                    mx-1
                                    font-medium
                                    text-gray-700
                                "
                            >
                                GET
                            </span>
                            and
                            <span
                                className="
                                    mx-1
                                    font-medium
                                    text-gray-700
                                "
                            >
                                https://example.com
                            </span>
                            as the default URL.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div
                            className="
                                border-b
                                bg-red-50
                                px-4
                                py-2
                                text-xs
                                text-red-600
                            "
                        >
                            {error}
                        </div>

                    )}
                </div>


                {/* ==================================
                    Footer
                ================================== */}

                <div
                    className="
                        flex
                        justify-end
                        gap-2
                        border-t
                        px-5
                        py-4
                    "
                >

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="
                            rounded-md
                            border
                            border-gray-300
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-gray-700
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={loading}
                        className="
                            rounded-md
                            bg-gray-900
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            hover:bg-gray-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {loading
                            ? "Creating..."
                            : "Create Request"}
                    </button>

                </div>

            </div>

        </div>
    );
}