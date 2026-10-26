
import { useEffect, useState } from "react";
import { ArrowUpRight, Boxes, Plus, Sparkles, X } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import WorkspaceCard from "../../components/workspace/workspaceCard";
import { useWorkspaceStore } from "../../store/WorkspaceStore";
import CreateWorkspaceForm from "../../components/workspace/createWorkspaceForm";
import InvitationsList from "../../components/workspace/invitationsList";

export default function Dashboard() {
    const { workspaces, loading, fetchWorkspaces } = useWorkspaceStore();
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return (
        <div className="flex min-h-screen flex-col bg-[#0D0A16] text-[#F5F0FF]">
            <Navbar />

            <div className="flex min-h-0 flex-1">
                <Sidebar workspaces={workspaces ?? []} />

                <main className="min-w-0 flex-1 bg-[#100B1B] px-5 py-7 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-[1440px]">
                        {/* Dashboard heading */}
                        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                                    <Sparkles size={14} />
                                    Developer workspace
                                </div>

                                <h1 className="text-3xl font-semibold tracking-tight text-[#FAF7FF] sm:text-4xl">
                                    Dashboard
                                </h1>

                                <p className="mt-2 text-sm text-[#B9ADC9] sm:text-base">
                                    Plan, organize and test your APIs in one place.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCreateWorkspaceOpen(true)}
                                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-400 focus:outline-none focus:ring-4 focus:ring-violet-500/25 sm:self-auto"
                            >
                                <Plus size={17} />
                                Create workspace
                            </button>
                        </div>

                        <InvitationsList />

                        {/* Workspace heading */}
                        <div className="mb-4 mt-6 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-[#F5F0FF]">
                                    Your workspaces
                                </h2>
                                <p className="mt-1 text-sm text-[#B9ADC9]">
                                    Jump back into a project or start something new.
                                </p>
                            </div>

                            <span className="rounded-full border border-[#49305F] bg-[#1B1228] px-3 py-1.5 text-xs font-medium text-violet-300">
                                {workspaces.length}{" "}
                                {workspaces.length === 1 ? "workspace" : "workspaces"}
                            </span>
                        </div>

                        {/* Workspace list */}
                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="h-48 animate-pulse rounded-2xl border border-[#30213F] bg-[#171122] p-5 "
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-violet-100" />
                                        <div className="mt-5 h-4 w-2/3 rounded bg-violet-50" />
                                        <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        ) : workspaces.length === 0 ? (
                            <div className="flex flex-col items-center rounded-2xl border border-[#30213F] bg-[#171122] px-6 py-14 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                                    <Boxes size={26} />
                                </div>

                                <h3 className="text-lg font-semibold text-[#35105f]">
                                    Your first workspace starts here
                                </h3>

                                <p className="mt-2 max-w-md text-sm leading-6 text-[#877994]">
                                    Create a workspace to group collections, manage
                                    environments, execute requests and collaborate with
                                    your team.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setIsCreateWorkspaceOpen(true)}
                                    className="aw-primary mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                                >
                                    <Plus size={16} />
                                    Create workspace
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {workspaces.map((workspace) => (
                                    <WorkspaceCard
                                        key={workspace.id}
                                        workspace={workspace}
                                    />
                                ))}

                                {/* Opens the same creation modal as the top button */}
                                <button
                                    type="button"
                                    onClick={() => setIsCreateWorkspaceOpen(true)}
                                    className="group flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#49305F] bg-[#171122]/60 p-6 text-center transition hover:border-violet-400 hover:bg-[#21152F] hover:shadow-lg hover:shadow-violet-950/20 focus:outline-none focus:ring-4 focus:ring-violet-500/20"
                                >
                                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:scale-105">
                                        <Plus size={21} />
                                    </span>

                                    <span className="font-medium text-[#E9DDFB]">
                                        Ready for another project?
                                    </span>

                                    <span className="mt-1 text-sm text-[#B9ADC9]">
                                        Create another workspace
                                    </span>

                                    <ArrowUpRight
                                        size={16}
                                        className="mt-3 text-violet-500"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Workspace Modal */}
            {isCreateWorkspaceOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#241536]/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsCreateWorkspaceOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-workspace-title"
                        className="w-full max-w-2xl rounded-2xl border border-violet-100 bg-white p-5 shadow-2xl shadow-violet-950/15 sm:p-7"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="create-workspace-title"
                                    className="text-xl font-semibold text-[#35105f]"
                                >
                                    Create workspace
                                </h2>
                                <p className="mt-1 text-sm text-[#9385a1]">
                                    Give your next API project a name and description.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCreateWorkspaceOpen(false)}
                                aria-label="Close create workspace dialog"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#877994] transition hover:bg-violet-50 hover:text-violet-700"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <CreateWorkspaceForm />
                    </div>
                </div>
            )}
        </div>
    );
}
