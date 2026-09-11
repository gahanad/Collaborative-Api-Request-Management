import { useState } from "react";

import { useEnvironmentStore } from "../../store/EnvironmentStore";


interface CreateVariableModalProps {
    environmentId: number;
    onClose: () => void;
}


export default function CreateVariableModal({
    environmentId,
    onClose,
}: CreateVariableModalProps) {

    const {
        createVariable,
        variableLoading,
        variableError,
    } = useEnvironmentStore();


    const [variableKey, setVariableKey] =
        useState("");

    const [variableValue, setVariableValue] =
        useState("");

    const [validationError, setValidationError] =
        useState<string | null>(null);


    // ==========================================
    // Create Variable
    // ==========================================

    const handleCreate = async () => {

        if (!variableKey.trim()) {

            setValidationError(
                "Variable key is required"
            );

            return;
        }


        if (!variableValue.trim()) {

            setValidationError(
                "Variable value is required"
            );

            return;
        }


        setValidationError(null);


        const result =
            await createVariable(
                environmentId,
                {
                    variableKey:
                        variableKey.trim(),

                    variableValue:
                        variableValue,
                }
            );


        if (result) {

            onClose();

        }
    };


    // ==========================================
    // Keyboard
    // ==========================================

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {

        if (event.key === "Enter") {

            handleCreate();

        }

        if (event.key === "Escape") {

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
                            Add Environment Variable
                        </h2>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            Add a variable to this
                            environment.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={variableLoading}
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
                    Variable Key
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
                        Variable Key
                    </label>


                    <input
                        type="text"
                        value={variableKey}
                        onChange={(event) => {

                            setVariableKey(
                                event.target.value
                            );

                            setValidationError(null);

                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="baseUrl"
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
                    Variable Value
                ================================== */}

                <div className="mt-4">

                    <label
                        className="
                            mb-2
                            block
                            text-sm
                            font-medium
                            text-gray-700
                        "
                    >
                        Variable Value
                    </label>


                    <input
                        type="text"
                        value={variableValue}
                        onChange={(event) => {

                            setVariableValue(
                                event.target.value
                            );

                            setValidationError(null);

                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={import.meta.env.VITE_API_BASE_URL}
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

                {(validationError ||
                    variableError) && (

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
                        {validationError ||
                            variableError}
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
                        onClick={handleCreate}
                        disabled={
                            variableLoading ||
                            !variableKey.trim() ||
                            !variableValue.trim()
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

                        {variableLoading
                            ? "Adding..."
                            : "Add Variable"}

                    </button>

                </div>

            </div>

        </div>
    );
}