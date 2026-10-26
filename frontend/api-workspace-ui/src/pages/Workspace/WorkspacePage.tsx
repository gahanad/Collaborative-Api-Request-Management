import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore }
from "../../store/WorkspaceStore";
import { useCollectionStore } from "../../store/CollectionStore";
import CollectionsSidebar from "../../components/workspace/collectionSidebar";
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
} = useCollaborationStore();


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

        connectCollaboration(id);

        return () => {

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

    
    
    return (
        <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#090711] text-[#f5f3ff]">
            {/* Workspace header */}
            <header className="z-20 flex shrink-0 items-center justify-between gap-4 border-b border-[#292238] bg-[#0d0a16] px-5 py-3">
                {/* Workspace title + environment */}
                <div className="flex min-w-0 flex-1 items-center gap-6">
                    <div className="min-w-0 shrink-0">
                        <h1 className="truncate text-xl font-semibold tracking-tight text-[#f5f3ff]">
                            {selectedWorkspace.name}
                        </h1>

                        <p className="truncate text-sm text-[#a79ab9]">
                            {selectedWorkspace.description || "No Description"}
                        </p>
                    </div>

                    <div className="shrink-0">
                        <EnvironmentManager />
                    </div>
                </div>

                {/* Collaboration + actions */}
                <div className="flex shrink-0 items-center gap-3">
                    <ActiveCollaborators />

                    <Link
                        to={`/workspaces/${workspaceId}/activity`}
                        className="rounded-lg border border-[#332a47] bg-[#151120] px-3 py-2 text-sm font-medium text-[#d6c8e8] transition hover:border-[#7043ad] hover:bg-[#211832]"
                    >
                        Activity
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="aw-primary whitespace-nowrap px-4 py-2 text-sm font-medium"
                    >
                        + Invite Member
                    </button>
                </div>
            </header>

            {/* Workspace panels */}
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                <CollectionsSidebar />
                <RequestEditor />

                <InviteModal
                    workspaceId={Number(workspaceId)}
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                />
            </div>
        </div>
    );
}