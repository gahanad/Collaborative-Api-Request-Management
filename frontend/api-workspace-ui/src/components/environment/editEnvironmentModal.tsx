import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useEnvironmentStore } from "../../store/EnvironmentStore";

interface EditEnvironmentModalProps {
    onClose: () => void;
}

export default function EditEnvironmentModal({
    onClose,
}: EditEnvironmentModalProps) {

    const { workspaceId } = useParams();

    const {
        selectedEnvironment,
        updateEnvironment,
        loading,
        error,
    } = useEnvironmentStore();


    // ==========================================
    // Local form state
    // ==========================================

    const [name, setName] = useState("");

    const [validationError, setValidationError] =
        useState<string | null>(null);


    // ==========================================
    // Load selected environment name
    // ==========================================

    useEffect(() => {

        if (selectedEnvironment) {

            setName(
                selectedEnvironment.name
            );
        }

    }, [selectedEnvironment]);


    // ==========================================
    // Update Environment
    // ==========================================

    const handleUpdate = async () => {

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
        // Environment validation
        // --------------------------------------

        if (!selectedEnvironment) {

            setValidationError(
                "No environment selected"
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
        // Update
        // --------------------------------------

        const updatedEnvironment =
            await updateEnvironment(
                Number(workspaceId),
                selectedEnvironment.id,
                {
                    name: name.trim(),
                }
            );


        // --------------------------------------
        // Success
        // --------------------------------------

        if (updatedEnvironment) {

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

            handleUpdate();
        }
    };


    // ==========================================
    // No selected environment
    // ==========================================

    if (!selectedEnvironment) {
        return null;
    }


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
                            Edit Environment
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            Rename this environment.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="
                            rounded-md
                            px-2
                            py-1
                            text-lg
                            text-gray-400
                            hover:bg-gray-100
                            hover:text-gray-700
                            disabled:opacity-50
                        "
                    >
                        ×
                    </button>

                </div>


                {/* ==================================
                    Environment Name
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
                        onClick={handleUpdate}
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
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </div>

        </div>
    );
}