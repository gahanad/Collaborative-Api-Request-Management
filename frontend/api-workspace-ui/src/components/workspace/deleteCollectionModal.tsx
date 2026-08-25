import { useCollectionStore } from "../../store/CollectionStore";
import type { CollectionSummary } from "../../types/collection";

interface DeleteCollectionModalProps {
    workspaceId: number;
    collection: CollectionSummary;
    onClose: () => void;
}

export default function DeleteCollectionModal({
    workspaceId,
    collection,
    onClose,
}: DeleteCollectionModalProps) {

    const { deleteCollection, loading } = useCollectionStore();

    const handleDelete = async () => {

        await deleteCollection(
            workspaceId,
            collection.id
        );

        onClose();

    };

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">

                <h2 className="text-lg font-semibold">

                    Delete Collection

                </h2>

                <p className="mt-3 text-gray-600">

                    Are you sure you want to delete

                    <span className="font-semibold">

                        {" "}
                        {collection.name}
                        {" "}

                    </span>

                    ?

                </p>

                <p className="mt-2 text-sm text-red-500">

                    This action cannot be undone.

                </p>

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="rounded border px-4 py-2 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>

                </div>

            </div>

        </div>

    );

}