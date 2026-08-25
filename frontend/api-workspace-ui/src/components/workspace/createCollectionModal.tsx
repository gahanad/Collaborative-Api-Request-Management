import { useState } from "react";
import { useCollectionStore } from "../../store/CollectionStore";

interface CreateCollectionModalProps {
    workspaceId: number;
    onClose: () => void;
}

export default function CreateCollectionModal({
    workspaceId,
    onClose,
}: CreateCollectionModalProps) {

    const { createCollection, loading } = useCollectionStore();

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!name.trim()) return;

        await createCollection(workspaceId, {

            name,

            description,

        });

        onClose();

    };

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">

                <h2 className="mb-5 text-xl font-semibold">

                    Create Collection

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
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Authentication APIs"
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
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Optional description"
                        />

                    </div>

                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border px-4 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading
                                ? "Creating..."
                                : "Create"}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}