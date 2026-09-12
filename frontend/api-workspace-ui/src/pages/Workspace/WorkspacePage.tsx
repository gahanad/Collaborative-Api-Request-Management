import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore }
from "../../store/WorkspaceStore";
import { useCollectionStore } from "../../store/CollectionStore";
import CollectionsSidebar from "../../components/workspace/collectionSidebar";
import RequestsSidebar from "../../components/workspace/requestsSidebar";
import RequestEditor from "../../components/requests/requestEditor";
import { useEnvironmentStore } from "@/store/EnvironmentStore";
import EnvironmentManager
    from "../../components/environment/environmentManager";
import { Link } from "react-router-dom";
import {
    useCollaborationStore,
} from "../../store/CollaborationStore";
import {
    useRequestStore,
} from "../../store/RequestStore";
import ActiveCollaborators
    from "../../components/collaboration/activeCollaborators";
import { useState } from "react";
import InviteModal from "../../components/workspace/invitesModal";
export default function WorkspacePage(){
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const {
        workspaceId
    } = useParams();
    const {
        fetchCollections,
        clearCollections
    } = useCollectionStore();

    const {
        fetchRequests,
    } = useRequestStore();

    const {
        fetchEnvironments,
        clearEnvironmentState
    } = useEnvironmentStore();

    const {
        selectedWorkspace,
        fetchWorkspaceById,
        clearSelectedWorkspace,
        loading
    } = useWorkspaceStore();

    const {
        connect: connectCollaboration,
        disconnect: disconnectCollaboration,
    } = useCollaborationStore();

    const {
        latestEvent,
    } = useCollaborationStore();

    const {
    activeCollaborators,
} = useCollaborationStore();

console.log(
    "🔥 WorkspacePage activeCollaborators:",
    activeCollaborators
);

    // ==========================================
    // Synchronize UI with Collaboration Events
    // ==========================================

    useEffect(() => {

        if (!latestEvent) {
            return;
        }


        if (!workspaceId) {
            return;
        }


        const id = Number(workspaceId);


        if (Number.isNaN(id)) {
            return;
        }


        // ==========================================
        // Ignore another workspace
        // ==========================================

        if (
            latestEvent.workspaceId !== id
        ) {
            return;
        }


        console.log(
            "Synchronizing UI:",
            latestEvent
        );


        // ==========================================
        // COLLECTION
        // ==========================================

        if (
            latestEvent.resourceType ===
            "COLLECTION"
        ) {

            fetchCollections(id);

            return;
        }


        // ==========================================
        // ENVIRONMENT
        // ==========================================

        if (
            latestEvent.resourceType ===
            "ENVIRONMENT"
        ) {

            fetchEnvironments(id);

            return;
        }


        // ==========================================
        // VARIABLE
        // ==========================================

        if (
            latestEvent.resourceType ===
            "VARIABLE"
        ) {

            // When variables change, fetch the variables for the
            // currently selected environment if one is selected.
            const currentEnvId = useEnvironmentStore.getState().selectedEnvironment?.id;
            if (currentEnvId) {
                useEnvironmentStore.getState().fetchVariables(currentEnvId);
            }

            return;
        }


        // ==========================================
        // REQUEST
        // ==========================================

        if (
            latestEvent.resourceType ===
            "REQUEST"
        ) {

            // Request created / updated / deleted
            if (
                latestEvent.sourceCollectionId
            ) {

                fetchRequests(
                    latestEvent.workspaceId,
                    latestEvent.sourceCollectionId
                );

            }


            // Request moved to another collection
            if (
                latestEvent.targetCollectionId
            ) {

                fetchRequests(
                    latestEvent.workspaceId,
                    latestEvent.targetCollectionId
                );

            }

            return;
        }

    }, [
        latestEvent,
        workspaceId,
        fetchCollections,
        fetchEnvironments,
        fetchRequests,
    ]);
    useEffect(() => {

        if (!workspaceId) return;

        const id = Number(workspaceId);

        fetchWorkspaceById(id);
        fetchCollections(id);
        fetchEnvironments(id);

        return () => {
            clearSelectedWorkspace();
            clearCollections();
            clearEnvironmentState();
        };

    }, [
        workspaceId,
        fetchWorkspaceById,
        fetchCollections,
        fetchEnvironments,
        clearSelectedWorkspace,
        clearCollections,
        clearEnvironmentState,
    ]);

    useEffect(() => {

        if (!workspaceId) {
            return;
        }

        const id = Number(workspaceId);

        if (Number.isNaN(id)) {
            return;
        }

        console.log(
            "Connecting collaboration WebSocket for workspace:",
            id
        );

        connectCollaboration(id);

        return () => {

            console.log(
                "Disconnecting collaboration WebSocket for workspace:",
                id
            );

            disconnectCollaboration();

        };

    }, [
        workspaceId,
        connectCollaboration,
        disconnectCollaboration,
    ]);
    if(loading){
        return (
            <div className="flex justify-center items-center h-screen">
                <h2 className="text-xl">
                    Loading...
                </h2>
            </div>
        );
    }

    if(!selectedWorkspace){
        return <h2>Workspace Not Found</h2>;
    }

    return(
        <div className="min-h-screen bg-gray-100 overflow-x-auto">
            <header
                className="bg-white shadow px-6 py-4"
            >
                <div>
                    <h1 className="text-3xl font-bold">
                        {selectedWorkspace.name}
                    </h1>

                    <p className="text-gray-600">
                        {selectedWorkspace.description ||
                            "No Description"}
                    </p>
                </div>


                <div className="flex items-center gap-4">

                    <ActiveCollaborators />

                    <Link
                        to={`/workspaces/${workspaceId}/activity`}
                        className="
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-gray-700
                            hover:bg-gray-50
                        "
                    >
                        Activity
                    </Link>

                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        + Invite Member
                    </button>

                </div>
            </header>
            <div className="flex">
                {/* <aside
                    className="w-72 bg-white border-r min-h-screen p-5"
                >
                    <h2
                        className="font-semibold mb-4"
                    >
                        Collections
                    </h2>
                    <button
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        + Create Collection
                    </button>
                    <div
                        className="mt-5 text-gray-500"
                    >
                        No Collections Yet
                    </div>
                </aside> */}
                <div className="flex h-full">

                    <CollectionsSidebar />
                    <EnvironmentManager/>
                    <RequestsSidebar />
                    <RequestEditor />
                    <InviteModal 
                        workspaceId={Number(workspaceId)} 
                        isOpen={isInviteModalOpen} 
                        onClose={() => setIsInviteModalOpen(false)} 
                    />
                </div>
            </div>
        </div>
    );
}