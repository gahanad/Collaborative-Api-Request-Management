import { useEffect, useRef, useState } from "react";

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

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    return (
        <div
            ref={menuRef}
            className="relative"
        >
            <button
                onClick={() => setOpen(!open)}
                className="rounded p-1 hover:bg-gray-200"
            >
                ⋮
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full z-20 mt-2 w-40 rounded-md border bg-white shadow-lg"
                >
                    <button
                        onClick={() => {
                            setOpen(false);
                            onRename();
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                        ✏️ Rename
                    </button>

                    <button
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}