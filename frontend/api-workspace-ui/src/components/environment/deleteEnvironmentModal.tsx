import { useParams } from "react-router-dom";

import { useEnvironmentStore } from "../../store/EnvironmentStore";

interface DeleteEnvironmentModalProps {
    onClose: () => void;
}

export default function DeleteEnvironmentModal({
    onClose,
}: DeleteEnvironmentModalProps) {

    const { workspaceId } = useParams();

    const {
        selectedEnvironment,
        deleteEnvironment,
        loading,
        error,
    } = useEnvironmentStore();


    // ==========================================
    // Delete Environment
    // ==========================================

    const handleDelete = async () => {

        if (!workspaceId) {
            return;
        }

        if (!selectedEnvironment) {
            return;
        }

        const deleted =
            await deleteEnvironment(
                Number(workspaceId),
                selectedEnvironment.id
            );

        if (deleted) {
            onClose();
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
                        mb-4
                        flex
                        items-center
                        justify-between
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-gray-800
                        "
                    >
                        Delete Environment
                    </h2>


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
                    Warning
                ================================== */}

                <p
                    className="
                        text-sm
                        leading-6
                        text-gray-600
                    "
                >
                    Are you sure you want to delete
                    the environment{" "}
                    <span
                        className="
                            font-semibold
                            text-gray-800
                        "
                    >
                        "{selectedEnvironment.name}"
                    </span>
                    ?
                </p>


                <p
                    className="
                        mt-2
                        text-sm
                        text-gray-500
                    "
                >
                    This action cannot be undone.
                </p>


                {/* ==================================
                    Error
                ================================== */}

                {error && (

                    <div
                        className="
                            mt-4
                            rounded-md
                            bg-red-50
                            px-3
                            py-2
                            text-sm
                            text-red-600
                        "
                    >
                        {error}
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
                        onClick={handleDelete}
                        disabled={loading}
                        className="
                            rounded-md
                            bg-red-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-red-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {loading
                            ? "Deleting..."
                            : "Delete Environment"}

                    </button>

                </div>

            </div>

        </div>
    );
}