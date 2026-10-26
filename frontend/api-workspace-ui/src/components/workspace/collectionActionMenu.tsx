
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CollectionActionsMenuProps {
    onRename: () => void;
    onDelete: () => void;
}

export default function CollectionActionMenu({
    onRename,
    onDelete,
}: CollectionActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                aria-label="Collection actions"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((previous) => !previous)}
                className="rounded-lg p-1.5 text-[#9685a6] transition hover:bg-violet-100 hover:text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
                <MoreHorizontal size={17} />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-xl border border-[#eee7f5] bg-white p-1.5 shadow-xl shadow-violet-950/10"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onRename();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-[#655573] transition hover:bg-violet-50 hover:text-violet-800"
                    >
                        <Pencil size={15} />
                        Rename
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                        <Trash2 size={15} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
