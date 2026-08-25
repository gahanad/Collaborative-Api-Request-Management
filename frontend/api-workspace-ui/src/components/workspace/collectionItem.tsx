import type { CollectionSummary } from "../../types/collection";
import CollectionActionMenu from "./collectionActionMenu";

interface CollectionItemProps {
    collection: CollectionSummary;
    selected: boolean;
    onClick: () => void;
    onRename: () => void;
    onDelete: () => void;
}

export default function CollectionItem({
    collection,
    selected,
    onClick,
    onRename,
    onDelete,
}: CollectionItemProps) {

    return (

        <div
            className={`relative flex items-center justify-between rounded-md px-3 py-2 ${
                selected
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
            }`}
        >

            <button
                onClick={onClick}
                className="flex flex-1 items-center gap-2 text-left"
            >

                <span>📁</span>
                <span className="truncate">
                    {collection.name}
                </span>
            </button>

            <CollectionActionMenu
                onRename={onRename}
                onDelete={onDelete}
            />
        </div>

    );

}