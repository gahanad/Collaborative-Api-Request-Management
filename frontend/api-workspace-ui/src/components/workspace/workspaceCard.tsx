import type { WorkspaceSummary } from "../../types/workspace";
import { useWorkspaceStore } from "../../store/WorkspaceStore";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Boxes, CalendarDays, Trash2} from "lucide-react";

interface WorkspaceCardProps { workspace: WorkspaceSummary; }

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
    const navigate = useNavigate();
    const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);

    const handleDelete = async () => {
        const confirmDelete = window.confirm(`Delete "${workspace.name}"?`);
        if (!confirmDelete) return;
        try { await deleteWorkspace(workspace.id); }
        catch (error) { console.error(error); alert("Unable to delete workspace"); }
    };

    return (
        <article className="group aw-card flex min-h-48 flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/[0.06]">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700"><Boxes size={21} /></div>
                <button onClick={handleDelete} aria-label={`Delete ${workspace.name}`} className="rounded-lg p-2 text-[#b0a3bd] hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
            <h3 className="truncate text-base font-semibold text-[#f1ecf7]">{workspace.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#bea9d2]">{workspace.description || "A shared space for organizing and testing your APIs."}</p>
            <div className="mt-4 flex items-center justify-between border-t border-[#f1ebf6] pt-3">
                <span className="flex items-center gap-1.5 text-xs text-[#9b8aaa]"><CalendarDays size={13} />{new Date(workspace.createdAt).toLocaleDateString()}</span>
                <button onClick={() => navigate(`/workspaces/${workspace.id}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100">Open workspace <ArrowUpRight size={14} /></button>
            </div>
        </article>
    );
}
