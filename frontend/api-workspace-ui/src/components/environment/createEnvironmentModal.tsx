import { useState } from "react";
import { useParams } from "react-router-dom";

import { useEnvironmentStore } from "../../store/EnvironmentStore";

interface CreateEnvironmentModalProps {
    onClose: () => void;
}

export default function CreateEnvironmentModal({
    onClose,
}: CreateEnvironmentModalProps) {

    const { workspaceId } = useParams();

    const {
        createEnvironment,
        loading,
        error,
    } = useEnvironmentStore();

    const [name, setName] = useState("");

    const [validationError, setValidationError] =
        useState<string | null>(null);


    // ==========================================
    // Create Environment
    // ==========================================

    const handleCreate = async () => {

        // --------------------------------------
        // Workspace validation
        // --------------------------------------

        if (!workspaceId) {

            setValidationError(
                "Workspace not found"
            );

            return;
        }


        // --------------------------------------
        // Name validation
        // --------------------------------------

        if (!name.trim()) {

            setValidationError(
                "Environment name is required"
            );

            return;
        }


        setValidationError(null);


        // --------------------------------------
        // Create
        // --------------------------------------

        const environment =
            await createEnvironment(
                Number(workspaceId),
                {
                    name: name.trim(),
                }
            );


        // --------------------------------------
        // Success
        // --------------------------------------

        if (environment) {

            setName("");

            onClose();
        }
    };


    // ==========================================
    // Enter key
    // ==========================================

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {

        if (event.key === "Enter") {

            handleCreate();
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
                px-4
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
                    w-full
                    max-w-md
                    rounded-xl
                    bg-white
                    p-6
                    shadow-xl
                "
            >

                {/* ==================================
                    Header
                ================================== */}

                <div
                    className="
                        mb-5
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Create Environment
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            Create an environment for
                            this workspace.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-md
                            px-2
                            py-1
                            text-lg
                            text-gray-400
                            hover:bg-gray-100
                            hover:text-gray-700
                        "
                    >
                        ×
                    </button>

                </div>


                {/* ==================================
                    Name
                ================================== */}

                <div>

                    <label
                        className="
                            mb-2
                            block
                            text-sm
                            font-medium
                            text-gray-700
                        "
                    >
                        Environment name
                    </label>


                    <input
                        type="text"
                        value={name}
                        onChange={(event) => {

                            setName(
                                event.target.value
                            );

                            if (
                                validationError
                            ) {

                                setValidationError(
                                    null
                                );
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Local"
                        autoFocus
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


                {/* ==================================
                    Error
                ================================== */}

                {(validationError || error) && (

                    <div
                        className="
                            mt-3
                            rounded-md
                            bg-red-50
                            px-3
                            py-2
                            text-sm
                            text-red-600
                        "
                    >
                        {validationError || error}
                    </div>

                )}


                {/* ==================================
                    Buttons
                ================================== */}

                <div
                    className="
                        mt-6
                        flex
                        justify-end
                        gap-3
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
                            px-4
                            py-2
                            text-sm
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
                        disabled={
                            loading ||
                            !name.trim()
                        }
                        className="
                            rounded-md
                            bg-gray-900
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-gray-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {loading
                            ? "Creating..."
                            : "Create Environment"}

                    </button>

                </div>

            </div>

        </div>
    );
}