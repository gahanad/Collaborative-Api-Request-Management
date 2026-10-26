
import { useState } from "react";
import { useParams } from "react-router-dom";
import { FolderOpen, Plus } from "lucide-react";

import { useCollectionStore } from "../../store/CollectionStore";
import CollectionItem from "./collectionItem";
import CreateCollectionModal from "./createCollectionModal";
import DeleteCollectionModal from "./deleteCollectionModal";
import type { CollectionSummary } from "../../types/collection";
import RenameCollectionModal from "./renameCollectionModal";
import CollectionRequestList from "./collectionRequestList";

export default function CollectionsSidebar() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [collectionToDelete, setCollectionToDelete] =
        useState<CollectionSummary | null>(null);
    const [collectionToRename, setCollectionToRename] =
        useState<CollectionSummary | null>(null);

    const { workspaceId } = useParams();

    const {
        collections,
        selectedCollection,
        loading,
        selectCollection,
    } = useCollectionStore();

    const [expandedCollectionIds, setExpandedCollectionIds] =
        useState<Set<number>>(() => new Set());

    const toggleCollection = (collectionId: number) => {
        setExpandedCollectionIds((previous) => {
            const next = new Set(previous);

            if (next.has(collectionId)) {
                next.delete(collectionId);
            } else {
                next.add(collectionId);
            }

            return next;
        });
    };

    return (
        <>
            <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#292238] bg-[#100d19]">
                {/* Sidebar header */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#292238] px-4 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-[#f5f3ff]">
                            Collections
                        </h2>

                        <p className="mt-1 text-xs text-[#a79ab9]">
                            {collections.length}{" "}
                            {collections.length === 1
                                ? "collection"
                                : "collections"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#493365] bg-[#211632] px-3 py-2 text-xs font-semibold text-[#c4a5fd] transition hover:border-[#8050c9] hover:bg-[#302044] focus:outline-none focus:ring-4 focus:ring-violet-500/20"
                    >
                        <Plus size={14} />
                        New
                    </button>
                </div>

                {/* Collection list */}
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                    {loading && (
                        <div className="rounded-xl border border-[#292238] bg-[#151120] p-4 text-sm text-[#a79ab9]">
                            Loading collections...
                        </div>
                    )}

                    {!loading && collections.length === 0 && (
                        <div className="flex flex-col items-center rounded-xl border border-dashed border-[#403454] bg-[#151120] px-4 py-8 text-center">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#493365] bg-[#251936] text-[#c4a5fd]">
                                <FolderOpen size={21} />
                            </div>

                            <p className="text-sm font-semibold text-[#eee7ff]">
                                No collections yet
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#a79ab9]">
                                Create a collection to organize your API requests.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="aw-primary mt-4 px-3 py-2 text-xs font-semibold"
                            >
                                Create collection
                            </button>
                        </div>
                    )}

                    {!loading && collections.length > 0 && (
                        <div className="space-y-1">
                            {collections.map((collection) => {
                                const expanded =
                                    expandedCollectionIds.has(collection.id);

                                return (
                                    <div key={collection.id}>
                                        <CollectionItem
                                            collection={collection}
                                            selected={
                                                selectedCollection?.id === collection.id
                                            }
                                            expanded={expanded}
                                            onToggleExpand={() => {
                                                toggleCollection(collection.id);
                                                selectCollection(collection);
                                            }}
                                            onClick={() => {
                                                selectCollection(collection);

                                                setExpandedCollectionIds((previous) => {
                                                    const next = new Set(previous);
                                                    next.add(collection.id);
                                                    return next;
                                                });
                                            }}
                                            onRename={() =>
                                                setCollectionToRename(collection)
                                            }
                                            onDelete={() =>
                                                setCollectionToDelete(collection)
                                            }
                                        />

                                        {expanded && (
                                            <CollectionRequestList
                                                collection={collection}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar footer */}
                <div className="border-t border-[#292238] bg-[#0d0a16] px-4 py-3">
                    <p className="text-[11px] leading-5 text-[#9283a7]">
                        Organize requests by feature or service.
                    </p>
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
                    onClose={() => setCollectionToRename(null)}
                />
            )}

            {collectionToDelete && workspaceId && (
                <DeleteCollectionModal
                    workspaceId={Number(workspaceId)}
                    collection={collectionToDelete}
                    onClose={() => setCollectionToDelete(null)}
                />
            )}
        </>
    );
}
