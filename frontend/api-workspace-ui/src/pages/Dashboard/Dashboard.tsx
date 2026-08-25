import { useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import WorkspaceCard from "../../components/workspace/workspaceCard";
import { useWorkspaceStore } from "../../store/WorkspaceStore";
import CreateWorkspaceForm from "../../components/workspace/createWorkspaceForm";

export default function Dashboard() {
    const {
        workspaces,
        loading,
        fetchWorkspaces
    } = useWorkspaceStore();

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    if (loading) {
        return (
            <h2 className="p-5">
                Loading Workspaces...
            </h2>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6">
                    <h1 className="text-3xl font-bold">
                        Dashboard
                    </h1>
                    <p className="text-gray-500">
                        Your Workspaces
                    </p>
                    <CreateWorkspaceForm />
                    <div className="mt-6">
                        {
                            workspaces.length === 0 ? (
                                <div className="border rounded-lg p-8 text-center">
                                    <h2 className="text-xl font-semibold">
                                        No Workspaces Yet
                                    </h2>
                                    <p className="text-gray-500 mt-2">
                                        Create your first workspace to get started.
                                    </p>
                                </div>
                            ) : (
                                workspaces.map((workspace) => (
                                    <WorkspaceCard
                                        key={workspace.id}
                                        workspace={workspace}
                                    />
                                ))
                            )
                        }
                    </div>
                </main>
            </div>
        </div>
    );
}