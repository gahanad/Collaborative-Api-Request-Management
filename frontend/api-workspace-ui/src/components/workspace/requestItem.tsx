import {
  Copy,
  FolderInput,
  Trash2,
} from "lucide-react";
import type { RequestSummary } from "../../types/request";

interface RequestItemProps {
  request: RequestSummary;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: () => void;
}

const methodStyles: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  POST: "bg-violet-50 text-violet-700 ring-violet-200/70",
  PUT: "bg-amber-50 text-amber-700 ring-amber-200/70",
  PATCH: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70",
  DELETE: "bg-rose-50 text-rose-700 ring-rose-200/70",
  HEAD: "bg-slate-50 text-slate-600 ring-slate-200/70",
  OPTIONS: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
};

export default function RequestItem({
  request,
  isSelected,
  onClick,
  onDelete,
  onDuplicate,
  onMove,
}: RequestItemProps) {
  const method = String(request.method ?? "GET").toUpperCase();
  const badgeStyle =
    methodStyles[method] ?? "bg-purple-50 text-purple-700 ring-purple-200/70";

  return (
    <div
      className={`group relative mx-2 mb-1 flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-all duration-150 ${
        isSelected
          ? "border-violet-200 bg-violet-50 shadow-sm shadow-violet-950/[0.03]"
          : "border-transparent hover:border-[#f0e8f8] hover:bg-[#fcfaff]"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none"
        aria-current={isSelected ? "page" : undefined}
      >
        <span
          className={`inline-flex min-w-[55px] shrink-0 items-center justify-center rounded-md px-1.5 py-1 text-[9px] font-extrabold tracking-wide ring-1 ring-inset ${badgeStyle}`}
        >
          {method}
        </span>

        <span
          className={`min-w-0 truncate text-[12px] font-medium ${
            isSelected ? "text-[#4c1d75]" : "text-[#665674]"
          }`}
          title={request.name}
        >
          {request.name}
        </span>
      </button>

      <div
        className={`flex shrink-0 items-center gap-0.5 transition-opacity ${
          isSelected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate request"
          aria-label={`Duplicate ${request.name}`}
          className="rounded-md p-1.5 text-[#9885a9] transition hover:bg-violet-100 hover:text-violet-700"
        >
          <Copy size={13} />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMove();
          }}
          title="Move request"
          aria-label={`Move ${request.name}`}
          className="rounded-md p-1.5 text-[#9885a9] transition hover:bg-violet-100 hover:text-violet-700"
        >
          <FolderInput size={13} />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          title="Delete request"
          aria-label={`Delete ${request.name}`}
          className="rounded-md p-1.5 text-[#b5a2bd] transition hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {isSelected && (
        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-violet-500" />
      )}
    </div>
  );
}
