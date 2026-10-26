
import { Folder, FolderOpen, ChevronRight } from "lucide-react";
import type { CollectionSummary } from "../../types/collection";
import CollectionActionMenu from "./collectionActionMenu";

interface CollectionItemProps {
    collection: CollectionSummary;
    selected: boolean;
    onClick: () => void;
    onRename: () => void;
    onDelete: () => void;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

export default function CollectionItem({
    collection,
    selected,
    onClick,
    onRename,
    onDelete,
    expanded = false,
    onToggleExpand,
}: CollectionItemProps) {
    const Icon = expanded ? FolderOpen : Folder;

    return (
        <div
            className={`group flex min-w-0 items-center gap-1 rounded-xl border px-2 py-1.5 transition-all duration-150 ${
                selected
                    ? "border-violet-500/40 bg-[#251936] shadow-sm shadow-violet-950/20"
                    : "border-transparent hover:border-[#332743] hover:bg-[#191425]"
            }`}
        >
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    (onToggleExpand ?? onClick)();
                }}
                aria-label={expanded ? "Collapse collection" : "Expand collection"}
                aria-expanded={expanded}
                className={`flex h-7 w-5 shrink-0 items-center justify-center rounded-md transition ${
                    selected
                        ? "text-[#c4a5fd] hover:bg-violet-500/15"
                        : "text-[#89799f] hover:bg-[#302441] hover:text-[#c4a5fd]"
                }`}
            >
                <ChevronRight
                    size={14}
                    className={`transition-transform duration-150 ${
                        expanded ? "rotate-90" : ""
                    }`}
                />
            </button>

            <button
                type="button"
                onClick={onClick}
                aria-current={selected ? "true" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1.5 text-left outline-none"
            >
                <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                        selected
                            ? "text-[#a78bfa]"
                            : "text-[#9683b1] group-hover:text-[#c4a5fd]"
                    }`}
                />

                <span
                    className={`truncate text-sm ${
                        selected
                            ? "font-semibold text-[#eee7ff]"
                            : "font-medium text-[#b6a8c9] group-hover:text-[#f0eaff]"
                    }`}
                    title={collection.name}
                >
                    {collection.name}
                </span>
            </button>

            <div className="shrink-0 rounded-md text-[#9583ac] opacity-60 transition group-hover:opacity-100 focus-within:opacity-100">
                <CollectionActionMenu
                    onRename={onRename}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
}
