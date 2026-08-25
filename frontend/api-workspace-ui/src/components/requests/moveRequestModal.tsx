import {
    useEffect,
    useState,
} from "react";

import type {
    CollectionSummary,
} from "../../types/collection";

interface MoveRequestModalProps {
    open: boolean;
    requestName: string;
    collections: CollectionSummary[];
    currentCollectionId: number;
    moving: boolean;
    error: string | null;
    onCancel: () => void;
    onMove: (
        targetCollectionId: number
    ) => void;
}

export default function MoveRequestModal({
    open,
    requestName,
    collections,
    currentCollectionId,
    moving,
    error,
    onCancel,
    onMove,
}: MoveRequestModalProps) {

    const [
        targetCollectionId,
        setTargetCollectionId,
    ] = useState<number | "">("");

    // ==========================================
    // Reset selection whenever modal opens
    // ==========================================

    useEffect(() => {
        if (open) {
            setTargetCollectionId("");
        }
    }, [open]);

    if (!open) {
        return null;
    }

    // ==========================================
    // Remove current collection
    // ==========================================

    const availableCollections =
        collections.filter(
            (collection) =>
                collection.id !==
                currentCollectionId
        );
    const handleMove = () => {
        if (
            targetCollectionId === ""
        ) {
            return;
        }

        onMove(
            targetCollectionId
        );
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
                        Move Request
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-gray-500
                        "
                    >
                        Move
                        <span
                            className="
                                mx-1
                                font-medium
                                text-gray-800
                            "
                        >
                            "{requestName}"
                        </span>
                        to another collection.
                    </p>
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
                    <label
                        className="
                            mb-1.5
                            block
                            text-xs
                            font-medium
                            text-gray-700
                        "
                    >
                        Destination Collection
                    </label>

                    <select
                        value={
                            targetCollectionId
                        }
                        onChange={(event) => {

                            const value =
                                event.target.value;

                            setTargetCollectionId(
                                value === ""
                                    ? ""
                                    : Number(value)
                            );
                        }}
                        disabled={moving}
                        className="
                            w-full
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-2
                            text-sm
                            text-gray-800
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                        "
                    >
                        <option value="">
                            Select collection
                        </option>

                        {availableCollections.map(
                            (collection) => (
                                <option
                                    key={
                                        collection.id
                                    }
                                    value={
                                        collection.id
                                    }
                                >
                                    {
                                        collection.name
                                    }
                                </option>
                            )
                        )}
                    </select>

                    {availableCollections.length === 0 && (
                        <p
                            className="
                                mt-2
                                text-xs
                                text-gray-500
                            "
                        >
                            There are no other
                            collections available.
                        </p>
                    )}

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
                        disabled={moving}
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
                        onClick={handleMove}
                        disabled={
                            moving ||
                            targetCollectionId === "" ||
                            availableCollections.length === 0
                        }
                        className="
                            rounded-md
                            bg-blue-600
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {moving
                            ? "Moving..."
                            : "Move"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}