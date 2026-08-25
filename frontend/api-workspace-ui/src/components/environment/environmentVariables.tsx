import { useEffect, useState } from "react";

import { useEnvironmentStore } from "../../store/EnvironmentStore";
import CreateVariableModal
    from "./createVariableModal";

import EditVariableModal
    from "./editVariableModal";


// ==========================================
// Delete Variable Modal
// ==========================================

interface DeleteVariableModalProps {
    variableId: number;
    variableKey: string;
    onClose: () => void;
}


function DeleteVariableModal({
    variableId,
    variableKey,
    onClose,
}: DeleteVariableModalProps) {

    const {
        deleteVariable,
        variableLoading,
        variableError,
    } = useEnvironmentStore();


    // ==========================================
    // Delete
    // ==========================================

    const handleDelete = async () => {

        const deleted =
            await deleteVariable(
                variableId
            );

        if (deleted) {
            onClose();
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

                <h2
                    className="
                        text-lg
                        font-semibold
                        text-gray-800
                    "
                >
                    Delete Variable
                </h2>


                <p
                    className="
                        mt-3
                        text-sm
                        leading-6
                        text-gray-600
                    "
                >
                    Are you sure you want to delete
                    the variable{" "}
                    <span
                        className="
                            font-semibold
                            text-gray-800
                        "
                    >
                        "{variableKey}"
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


                {/* Error */}

                {variableError && (

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
                        {variableError}
                    </div>

                )}


                {/* Buttons */}

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
                        disabled={variableLoading}
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
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={variableLoading}
                        className="
                            rounded-md
                            bg-red-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-red-700
                            disabled:opacity-50
                        "
                    >

                        {variableLoading
                            ? "Deleting..."
                            : "Delete Variable"}

                    </button>

                </div>

            </div>

        </div>
    );
}


// ==========================================
// Main Environment Variables Component
// ==========================================

export default function EnvironmentVariables() {

    const {
        selectedEnvironment,

        variables,

        variableLoading,

        variableError,

        fetchVariables,
    } = useEnvironmentStore();


    // ==========================================
    // Modal states
    // ==========================================

    const [
        showCreateModal,
        setShowCreateModal,
    ] = useState(false);


    const [
        editingVariable,
        setEditingVariable,
    ] = useState<{
        id: number;
        key: string;
        value: string;
    } | null>(null);


    const [
        deletingVariable,
        setDeletingVariable,
    ] = useState<{
        id: number;
        key: string;
    } | null>(null);


    // ==========================================
    // Load variables
    // ==========================================

    useEffect(() => {

        if (!selectedEnvironment) {
            return;
        }

        fetchVariables(
            selectedEnvironment.id
        );

    }, [
        selectedEnvironment?.id,
        fetchVariables,
    ]);


    // ==========================================
    // No environment
    // ==========================================

    if (!selectedEnvironment) {

        return (

            <div
                className="
                    flex
                    h-full
                    items-center
                    justify-center
                    px-6
                "
            >

                <div className="text-center">

                    <div
                        className="
                            mb-3
                            text-3xl
                        "
                    >
                        ⚙
                    </div>

                    <h3
                        className="
                            text-sm
                            font-semibold
                            text-gray-700
                        "
                    >
                        No environment selected
                    </h3>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        Select an environment to
                        manage its variables.
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div
            className="
                h-full
                overflow-y-auto
                bg-white
            "
        >

            {/* ==================================
                Header
            ================================== */}

            <div
                className="
                    flex
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
                            text-sm
                            font-semibold
                            text-gray-800
                        "
                    >
                        Environment Variables
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-gray-500
                        "
                    >
                        {selectedEnvironment.name}
                    </p>

                </div>


                <button
                    type="button"
                    onClick={() =>
                        setShowCreateModal(true)
                    }
                    className="
                        rounded-md
                        bg-gray-900
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-white
                        hover:bg-gray-800
                    "
                >
                    + Add Variable
                </button>

            </div>


            {/* ==================================
                Error
            ================================== */}

            {variableError && (
                <div
                    className="
                        mx-5
                        mt-4
                        rounded-md
                        bg-red-50
                        px-3
                        py-2
                        text-sm
                        text-red-600
                    "
                >
                    {variableError}
                </div>
            )}


            {/* ==================================
                Loading
            ================================== */}

            {variableLoading &&
                variables.length === 0 && (

                <div
                    className="
                        px-5
                        py-8
                        text-center
                        text-sm
                        text-gray-500
                    "
                >
                    Loading variables...
                </div>
            )}


            {/* ==================================
                Empty
            ================================== */}

            {!variableLoading &&
                variables.length === 0 &&
                !variableError && (

                <div
                    className="
                        px-5
                        py-10
                        text-center
                    "
                >

                    <div
                        className="
                            mb-3
                            text-3xl
                        "
                    >
                        ＋
                    </div>

                    <h3
                        className="
                            text-sm
                            font-semibold
                            text-gray-700
                        "
                    >
                        No variables
                    </h3>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        Add variables such as
                        baseUrl, token, or apiKey.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setShowCreateModal(true)
                        }
                        className="
                            mt-4
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-gray-700
                            hover:bg-gray-50
                        "
                    >
                        + Add Variable
                    </button>

                </div>
            )}


            {/* ==================================
                Variable List
            ================================== */}

            {variables.length > 0 && (

                <div
                    className="
                        divide-y
                        divide-gray-200
                    "
                >

                    {variables.map(
                        (variable) => (

                            <div
                                key={variable.id}
                                className="
                                    flex
                                    items-center
                                    gap-4
                                    px-5
                                    py-3
                                    hover:bg-gray-50
                                "
                            >

                                {/* Key */}

                                <div
                                    className="
                                        min-w-0
                                        flex-1
                                    "
                                >

                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-medium
                                            text-gray-800
                                        "
                                    >
                                        {variable.variableKey}
                                    </p>

                                </div>


                                {/* Value */}

                                <div
                                    className="
                                        min-w-0
                                        flex-[2]
                                    "
                                >

                                    <p
                                        className="
                                            truncate
                                            font-mono
                                            text-sm
                                            text-gray-600
                                        "
                                    >
                                        {variable.variableValue}
                                    </p>

                                </div>


                                {/* Actions */}

                                <div
                                    className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-2
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingVariable({
                                                id:
                                                    variable.id,

                                                key:
                                                    variable.variableKey,

                                                value:
                                                    variable.variableValue,
                                            })
                                        }
                                        className="
                                            rounded-md
                                            px-2
                                            py-1
                                            text-xs
                                            font-medium
                                            text-gray-600
                                            hover:bg-gray-100
                                            hover:text-gray-900
                                        "
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeletingVariable({
                                                id:
                                                    variable.id,

                                                key:
                                                    variable.variableKey,
                                            })
                                        }
                                        className="
                                            rounded-md
                                            px-2
                                            py-1
                                            text-xs
                                            font-medium
                                            text-red-600
                                            hover:bg-red-50
                                        "
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>
            )}

            {/* ==================================
                Delete Modal
            ================================== */}

            {deletingVariable && (

                <DeleteVariableModal
                    variableId={
                        deletingVariable.id
                    }

                    variableKey={
                        deletingVariable.key
                    }

                    onClose={() =>
                        setDeletingVariable(null)
                    }
                />

            )}

            {/* ==================================
                Create Variable Modal
            ================================== */}

            {showCreateModal && (

                <CreateVariableModal
                    environmentId={
                        selectedEnvironment.id
                    }

                    onClose={() =>
                        setShowCreateModal(false)
                    }
                />

            )}


            {/* ==================================
                Edit Variable Modal
            ================================== */}

            {editingVariable && (

                <EditVariableModal

                    variableId={
                        editingVariable.id
                    }

                    initialKey={
                        editingVariable.key
                    }

                    initialValue={
                        editingVariable.value
                    }

                    onClose={() =>
                        setEditingVariable(null)
                    }

                />

            )}

        </div>
    );
}