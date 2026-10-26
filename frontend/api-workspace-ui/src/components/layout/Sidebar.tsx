
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/WorkspaceStore";

type Workspace = ReturnType<typeof useWorkspaceStore.getState>["workspaces"][number];

interface SidebarProps {
  workspaces: Workspace[];
}

export default function Sidebar({ workspaces = [] }: SidebarProps) {
  const [workspacesOpen, setWorkspacesOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="hidden w-[232px] shrink-0 border-r border-[#3B2B4D] bg-[#21172F] lg:flex lg:flex-col">
      <div className="border-b border-[#3B2B4D] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-400 text-white shadow-md shadow-purple-950/30">
            <span className="text-lg font-bold">{`{ }`}</span>
          </div>
          <div>
            <div className="font-semibold tracking-tight text-[#F5F0FF]">
              API Workspace
            </div>
            <div className="mt-0.5 text-[11px] text-[#B9A9CB]">
              Build · Test · Collaborate
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A99ABD]">
          Workspace
        </p>

        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border border-violet-400/20 bg-[#38254F] text-[#D9C3FF] shadow-sm shadow-violet-950/20"
                  : "text-[#C1B3D1] hover:bg-[#2D2040] hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={17} strokeWidth={1.8} />
            Dashboard
          </NavLink>

          <button
            type="button"
            onClick={() => setWorkspacesOpen((open) => !open)}
            aria-expanded={workspacesOpen}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              workspacesOpen
                ? "border border-violet-400/20 bg-[#38254F] text-[#D9C3FF] shadow-sm shadow-violet-950/20"
                : "text-[#C1B3D1] hover:bg-[#2D2040] hover:text-white"
            }`}
          >
            <Boxes size={17} strokeWidth={1.8} />
            <span className="flex-1 text-left">Workspaces</span>
            {workspacesOpen ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronRight size={15} />
            )}
          </button>

          {workspacesOpen && (
            <div className="ml-4 space-y-1 border-l border-[#49365E] pl-3">
              {workspaces.length === 0 ? (
                <p className="px-3 py-2 text-xs leading-5 text-[#A99ABD]">
                  No workspaces yet
                </p>
              ) : (
                workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    type="button"
                    title={workspace.name}
                    onClick={() => navigate(`/workspaces/${workspace.id}`)}
                    className="w-full truncate rounded-lg px-3 py-2 text-left text-sm text-[#B9A9CB] transition hover:bg-[#2D2040] hover:text-white"
                  >
                    {workspace.name}
                  </button>
                ))
              )}
            </div>
          )}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-[#382052] via-[#542B80] to-[#7540A5] p-4 text-white shadow-lg shadow-purple-950/20">
          <p className="text-sm font-semibold">Built for your workflow</p>
          <p className="mt-1 text-xs leading-5 text-violet-100">
            Keep your API collections and environments organized.
          </p>
        </div>
      </div>
    </aside>
  );
}
