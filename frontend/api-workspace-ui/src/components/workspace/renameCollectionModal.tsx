import { useState } from "react";
import type { CollectionSummary } from "../../types/collection";
import { useCollectionStore } from "../../store/CollectionStore";
interface RenameCollectionModalProps {
    workspaceId: number;
    collection: CollectionSummary;
    onClose: () => void;
}

export default function RenameCollectionModal({
    workspaceId,
    collection,
    onClose,
}: RenameCollectionModalProps) {
    const {
        updateCollection,
        loading,
    } = useCollectionStore();
    const [name, setName] = useState(collection.name);
    const [description, setDescription] =
        useState(collection.description ?? "");
    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        if (!name.trim()) return;
        await updateCollection(
            workspaceId,
            collection.id,
            {
                name,
                description,
            }
        );
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 className="mb-5 text-xl font-semibold">
                    Rename Collection
                </h2>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            rows={4}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded border px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-blue-600 px-4 py-2 text-white"
                        >
                            {loading
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}