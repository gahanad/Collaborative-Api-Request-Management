import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCollectionStore } from "../../store/CollectionStore";
import CollectionItem from "./collectionItem";
import CreateCollectionModal from "./createCollectionModal";
import DeleteCollectionModal from "./deleteCollectionModal";
import type { CollectionSummary } from "../../types/collection";
import RenameCollectionModal from "./renameCollectionModal";


export default function CollectionsSidebar() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [collectionToDelete, setCollectionToDelete] =
    useState<CollectionSummary | null>(null);
    const { workspaceId } = useParams();
    const [collectionToRename, setCollectionToRename] =
    useState<CollectionSummary | null>(null);

    const {
        collections,
        selectedCollection,
        loading,
        selectCollection,
    } = useCollectionStore();

    return (
        <>
            <aside className="w-72 border-r bg-white flex flex-col">

                {/* Header */}
                <div className="border-b p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Collections
                        </h2>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                            + New
                        </button>
                    </div>
                </div>

                {/* Collections List */}
                <div className="flex-1 overflow-visible">

                    {loading && (
                        <div className="p-4 text-gray-500">
                            Loading collections...
                        </div>
                    )}

                    {!loading && collections.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">
                            No collections found.
                        </div>
                    )}

                    {!loading &&
                        collections.map((collection) => (
                            <CollectionItem
                                key={collection.id}
                                collection={collection}
                                selected={
                                    selectedCollection?.id === collection.id
                                }
                                onClick={() =>
                                    selectCollection(collection)
                                }
                                onRename={() =>
                                    setCollectionToRename(collection)
                                }
                                onDelete={() =>
                                    setCollectionToDelete(collection)
                                }
                            />
                        ))}
                </div>
            </aside>

            {showCreateModal && workspaceId && (
                <CreateCollectionModal
                    workspaceId={Number(workspaceId)}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
            {collectionToRename && workspaceId && (
                <RenameCollectionModal
                    workspaceId={Number(workspaceId)}
                    collection={collectionToRename}
                    onClose={() =>
                        setCollectionToRename(null)
                    }
                />
            )}
            {collectionToDelete && workspaceId && (
                <DeleteCollectionModal
                    workspaceId={Number(workspaceId)}
                    collection={collectionToDelete}
                    onClose={() =>
                        setCollectionToDelete(null)
                    }
                />

            )}
        </>
    );
}