interface DeleteRequestModalProps {
    open: boolean;

    requestName: string;

    deleting: boolean;

    error: string | null;

    onCancel: () => void;

    onConfirm: () => void;
}


export default function DeleteRequestModal({
    open,
    requestName,
    deleting,
    error,
    onCancel,
    onConfirm,
}: DeleteRequestModalProps) {

    if (!open) {
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
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-sm
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
                        Delete Request
                    </h2>

                </div>


                {/* ==================================
                    Content
                ================================== */}

                <div
                    className="
                        px-5
                        py-5
                    "
                >

                    <p
                        className="
                            text-sm
                            text-gray-600
                        "
                    >
                        Are you sure you want to delete
                        <span
                            className="
                                mx-1
                                font-semibold
                                text-gray-900
                            "
                        >
                            "{requestName}"
                        </span>
                        ?
                    </p>


                    <p
                        className="
                            mt-2
                            text-xs
                            text-gray-500
                        "
                    >
                        This action cannot be undone.
                    </p>


                    {error && (

                        <div
                            className="
                                mt-4
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
                        onClick={onCancel}
                        disabled={deleting}
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
                        onClick={onConfirm}
                        disabled={deleting}
                        className="
                            rounded-md
                            bg-red-600
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            hover:bg-red-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>

                </div>

            </div>

        </div>
    );
}