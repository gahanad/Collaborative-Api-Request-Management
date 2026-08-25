import { useEffect, useState } from "react";

import { useRequestStore } from "../../store/RequestStore";

interface RequestMetadataEditorProps {
    workspaceId: number;
    onClose: () => void;
}

export default function RequestMetadataEditor({
    workspaceId,
    onClose,
}: RequestMetadataEditorProps) {

    const {
        selectedRequest,
        updateRequest,
    } = useRequestStore();


    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");


    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    // ==========================================
    // Sync selected request → local form
    // ==========================================

    useEffect(() => {

        if (!selectedRequest) {
            return;
        }

        setName(
            selectedRequest.name
        );

        setDescription(
            selectedRequest.description ?? ""
        );

        setError(null);

    }, [selectedRequest]);


    // ==========================================
    // No request
    // ==========================================

    if (!selectedRequest) {
        return null;
    }


    // ==========================================
    // Save Metadata
    // ==========================================

    const handleSave = async () => {

        setError(null);


        const trimmedName =
            name.trim();


        // ==========================================
        // Validation
        // ==========================================

        if (!trimmedName) {

            setError(
                "Request name is required."
            );

            return;
        }


        setSaving(true);


        try {

            const updatedRequest =
                await updateRequest(

                    workspaceId,

                    selectedRequest.collection.id,

                    selectedRequest.id,

                    {
                        name: trimmedName,

                        description:
                            description.trim() ||
                            null,

                        method:
                            selectedRequest.method,

                        url:
                            selectedRequest.url,

                        body:
                            selectedRequest.body,

                        authType:
                            selectedRequest.authorization
                                ?.authType ?? "NONE",

                        bearerToken:
                            selectedRequest.authorization
                                ?.bearerToken ?? null,

                        username:
                            selectedRequest.authorization
                                ?.username ?? null,

                        password:
                            selectedRequest.authorization
                                ?.password ?? null,

                        apiKeyName:
                            selectedRequest.authorization
                                ?.apiKeyName ?? null,

                        apiKey:
                            selectedRequest.authorization
                                ?.apiKey ?? null,

                        apiKeyLocation:
                            selectedRequest.authorization
                                ?.apiKeyLocation ?? null,
                    }
                );


            if (!updatedRequest) {

                throw new Error(
                    "Failed to update request."
                );

            }


            onClose();

        } catch (error) {

            console.error(
                "Failed to update request metadata:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update request."
            );

        } finally {

            setSaving(false);

        }
    };


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

                {/* Header */}

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
                        Edit Request
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-gray-500
                        "
                    >
                        Update the request name
                        and description.
                    </p>

                </div>


                {/* Form */}

                <div
                    className="
                        space-y-4
                        px-5
                        py-5
                    "
                >

                    {/* Name */}

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
                            disabled={saving}
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
                            rows={3}
                            disabled={saving}
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


                    {error && (

                        <div
                            className="
                                rounded-md
                                border
                                border-red-200
                                bg-red-50
                                px-3
                                py-2
                                text-xs
                                text-red-600
                            "
                        >
                            {error}
                        </div>

                    )}

                </div>


                {/* Footer */}

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
                        disabled={saving}
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
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="
                            rounded-md
                            bg-gray-900
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            hover:bg-gray-800
                            disabled:opacity-50
                        "
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

            </div>

        </div>
    );
}