import type { WorkspaceSummary } from "../../types/workspace";
import { useWorkspaceStore } from "../../store/WorkspaceStore";
import { useNavigate } from "react-router-dom";

interface WorkspaceCardProps {
    workspace: WorkspaceSummary;
}

export default function WorkspaceCard({
    workspace
}: WorkspaceCardProps) {

    const navigate = useNavigate();
    const deleteWorkspace =
        useWorkspaceStore(
            (state) => state.deleteWorkspace
        );

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Delete "${workspace.name}" ?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteWorkspace(
                workspace.id
            );
        }

        catch (error) {
            console.error(error);
            alert("Unable to delete workspace");
        }
    };

    return (
        <div className="border rounded-lg p-5 mb-4 shadow-sm">
            <h2 className="text-xl font-semibold">
                {workspace.name}
            </h2>
            <p className="text-gray-600 mt-2">
                Description :
                {workspace.description || "No description"}
            </p>
            <p className="text-gray-500 mt-2">
                Created :
                {
                    new Date(
                        workspace.createdAt
                    ).toLocaleDateString()
                }
            </p>
            <div className="mt-4 flex gap-3">
                <button
                    onClick={()=>
                        navigate(
                            `/workspaces/${workspace.id}`
                        )
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Open
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}