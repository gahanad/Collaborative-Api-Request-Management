import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCollectionStore } from "../../store/CollectionStore";
import { useRequestStore } from "../../store/RequestStore";
import { useHeaderStore } from "../../store/HeaderStore";
import { useQueryParamStore } from "../../store/QueryParamStore";
import type {
    CreateRequestRequest,
} from "../../types/request";
import type {
    RequestSummary,
} from "../../types/request";

import MoveRequestModal
    from "../requests/moveRequestModal";

import NewRequestModal from "../requests/newRequestModal";
import DeleteRequestModal from "../requests/deleteRequestModal";

import RequestItem from "./requestItem";
import { useHistoryStore } from "../../store/HistoryStore";

export default function RequestsSidebar() {

    const { workspaceId } = useParams();

    const {
        fetchHistory,
        clearHistoryState,
    } = useHistoryStore();
    const {
        collections,
        selectedCollection,
    } = useCollectionStore();

    

    const {
        requests,
        selectedRequest,
        loading: requestLoading,
        error: requestError,
        fetchRequests,
        fetchRequestById,
        createRequest,
        clearRequests,
        deleteRequest,
        duplicateRequest,
        moveRequest
    } = useRequestStore();

    const isSelectedRequestFromCurrentCollection =
        selectedRequest?.collection.id ===
        selectedCollection?.id;

    const [
        newRequestModalOpen,
        setNewRequestModalOpen,
    ] = useState(false);

    const {
        fetchHeaders,
        clearHeaders,
    } = useHeaderStore();

    const {
        fetchQueryParams,
        clearQueryParams,
    } = useQueryParamStore();

    const [
        requestToDelete,
        setRequestToDelete,
    ] = useState<RequestSummary | null>(null);

    const [
        deletingRequest,
        setDeletingRequest,
    ] = useState(false);

    const [
        deleteError,
        setDeleteError,
    ] = useState<string | null>(null);

    const [
        requestToMove,
        setRequestToMove,
    ] = useState<RequestSummary | null>(null);


    const [
        movingRequest,
        setMovingRequest,
    ] = useState(false);


    const [
        moveError,
        setMoveError,
    ] = useState<string | null>(null);


    // ==========================================
    // Load requests when collection changes
    // ==========================================

    useEffect(() => {

        // ==========================================
        // No collection selected
        // ==========================================

        if (!workspaceId || !selectedCollection) {

            clearRequests();

            clearHeaders();

            clearQueryParams();

            return;
        }


        // ==========================================
        // Convert workspace ID
        // ==========================================

        const workspaceIdNumber =
            Number(workspaceId);

        if (Number.isNaN(workspaceIdNumber)) {

            clearRequests();

            clearHeaders();

            clearQueryParams();

            return;
        }


        // ==========================================
        // Clear previous collection state
        // ==========================================

        clearRequests();

        clearHeaders();

        clearQueryParams();
        clearHistoryState();


        // ==========================================
        // Load requests for new collection
        // ==========================================

        fetchRequests(
            workspaceIdNumber,
            selectedCollection.id
        );

    }, [
        workspaceId,
        selectedCollection?.id,
        fetchRequests,
        clearRequests,
        clearHeaders,
        clearQueryParams,
        clearHistoryState
    ]);


    // ==========================================
    // Select Request
    // ==========================================

    const handleRequestSelect = async (
        requestId: number
    ) => {

        if (
            !workspaceId ||
            !selectedCollection
        ) {
            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (Number.isNaN(workspaceIdNumber)) {
            return;
        }


        // ==========================================
        // Clear old request-related state
        // ==========================================

        clearHeaders();

        clearQueryParams();

        clearHistoryState();


        try {

            // ==========================================
            // Load selected request
            // ==========================================

            await fetchRequestById(
                workspaceIdNumber,
                selectedCollection.id,
                requestId
            );


            // ==========================================
            // Load request-related data together
            // ==========================================

            await Promise.all([

                fetchHeaders(
                    workspaceIdNumber,
                    selectedCollection.id,
                    requestId
                ),

                fetchQueryParams(
                    workspaceIdNumber,
                    selectedCollection.id,
                    requestId
                ),

                fetchHistory(
                    workspaceIdNumber,
                    selectedCollection.id,
                    requestId
                ),

            ]);

        } catch (error) {

            console.error(
                "Failed to select request:",
                error
            );

        }

    };

    
    // ==========================================
    // Create New Request
    // ==========================================

    const handleCreateRequest = async (
        request: CreateRequestRequest
    ) => {

        if (
            !workspaceId ||
            !selectedCollection
        ) {
            return;
        }

        const workspaceIdNumber =
            Number(workspaceId);

        if (Number.isNaN(workspaceIdNumber)) {
            return;
        }


        try {

            const createdRequest =
                await createRequest(
                    workspaceIdNumber,
                    selectedCollection.id,
                    request
                );


            if (!createdRequest) {

                throw new Error(
                    "Failed to create request."
                );

            }


            // ==========================================
            // Load headers and query params
            // ==========================================

            await Promise.all([

                fetchHeaders(
                    workspaceIdNumber,
                    selectedCollection.id,
                    createdRequest.id
                ),

                fetchQueryParams(
                    workspaceIdNumber,
                    selectedCollection.id,
                    createdRequest.id
                ),

            ]);


            // ==========================================
            // Close modal
            // ==========================================

            setNewRequestModalOpen(false);

        } catch (error) {

            console.error(
                "Failed to create request:",
                error
            );

            throw error;

        }
    };

    // Delete request
    const handleDeleteRequest = async () => {

        if (
            !workspaceId ||
            !selectedCollection ||
            !requestToDelete
        ) {
            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (
            Number.isNaN(
                workspaceIdNumber
            )
        ) {

            setDeleteError(
                "Invalid workspace."
            );

            return;
        }


        setDeletingRequest(true);

        setDeleteError(null);


        try {

            await deleteRequest(

                workspaceIdNumber,

                selectedCollection.id,

                requestToDelete.id

            );


            // ==========================================
            // Close confirmation modal
            // ==========================================

            setRequestToDelete(null);


        } catch (error) {

            console.error(
                "Failed to delete request:",
                error
            );


            setDeleteError(

                error instanceof Error
                    ? error.message
                    : "Failed to delete request."

            );

        } finally {

            setDeletingRequest(false);

        }
    };

    const handleRequestDeleteClick = (
        request: RequestSummary
    ) => {

        setDeleteError(null);

        setRequestToDelete(request);

    };

    // Handle duplicate Request
    const handleDuplicateRequest = async (
        requestId: number
    ) => {

        if (
            !workspaceId ||
            !selectedCollection
        ) {
            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (
            Number.isNaN(
                workspaceIdNumber
            )
        ) {

            console.error(
                "Invalid workspace ID."
            );

            return;
        }


        try {

            const duplicatedRequest =
                await duplicateRequest(

                    workspaceIdNumber,

                    selectedCollection.id,

                    requestId

                );


            if (!duplicatedRequest) {

                throw new Error(
                    "Failed to duplicate request."
                );

            }


            // ==========================================
            // Load headers + query params
            // ==========================================

            await Promise.all([

                fetchHeaders(
                    workspaceIdNumber,
                    selectedCollection.id,
                    duplicatedRequest.id
                ),

                fetchQueryParams(
                    workspaceIdNumber,
                    selectedCollection.id,
                    duplicatedRequest.id
                ),

            ]);

        } catch (error) {

            console.error(
                "Failed to duplicate request:",
                error
            );

        }
    };

    const handleRequestMoveClick = (
        request: RequestSummary
    ) => {
        setMoveError(null);
        setRequestToMove(request);
    };

    const handleMoveRequest = async (
        targetCollectionId: number
    ) => {

        if (
            !workspaceId ||
            !selectedCollection ||
            !requestToMove
        ) {
            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (
            Number.isNaN(
                workspaceIdNumber
            )
        ) {

            setMoveError(
                "Invalid workspace."
            );

            return;

        }


        setMovingRequest(true);

        setMoveError(null);


        try {

            const movedRequest =
                await moveRequest(

                    workspaceIdNumber,

                    selectedCollection.id,

                    requestToMove.id,

                    targetCollectionId

                );


            if (!movedRequest) {

                throw new Error(
                    "Failed to move request."
                );

            }


            // ==========================================
            // If selected request was moved,
            // clear request-specific UI state
            // ==========================================

            if (
                selectedRequest?.id ===
                requestToMove.id
            ) {

                clearHeaders();

                clearQueryParams();

            }


            // ==========================================
            // Close modal
            // ==========================================

            setRequestToMove(null);

            setMoveError(null);

        } catch (error) {

            console.error(
                "Failed to move request:",
                error
            );


            setMoveError(

                error instanceof Error
                    ? error.message
                    : "Failed to move request."

            );

        } finally {

            setMovingRequest(false);

        }
    };

    return (

        <>
            <aside className="flex h-full w-72 flex-col border-r bg-white">

                {/* Header */}

                <div className="border-b p-4">

                    <div className="flex items-center justify-between">

                        <h2 className="text-sm font-semibold text-gray-900">
                            Requests
                        </h2>

                        {selectedCollection && (

                            <button
                                type="button"
                                onClick={() =>
                                    setNewRequestModalOpen(true)
                                }
                                className="
                                    rounded-md
                                    px-2
                                    py-1
                                    text-xs
                                    font-medium
                                    text-gray-600
                                    hover:bg-gray-100
                                    hover:text-gray-900
                                "
                            >
                                + New
                            </button>

                        )}

                    </div>


                    {selectedCollection && (

                        <p
                            className="
                                mt-1
                                truncate
                                text-xs
                                text-gray-500
                            "
                            title={selectedCollection.name}
                        >
                            {selectedCollection.name}
                        </p>

                    )}

                </div>


                {/* Request List */}

                <div className="min-h-0 flex-1 overflow-y-auto">

                    {/* No collection selected */}

                    {!selectedCollection && (

                        <div className="p-4 text-sm text-gray-500">

                            Select a collection to view requests.

                        </div>

                    )}


                    {/* Loading */}

                    {selectedCollection &&
                        requestLoading && (

                            <div className="p-4 text-sm text-gray-500">

                                Loading requests...

                            </div>

                        )
                    }


                    {/* Error */}

                    {selectedCollection &&
                        !requestLoading &&
                        requestError && (

                            <div className="p-4 text-sm text-red-600">

                                {requestError}

                            </div>

                        )
                    }


                    {/* Empty */}

                    {selectedCollection &&
                        !requestLoading &&
                        !requestError &&
                        requests.length === 0 && (

                            <div className="p-4 text-sm text-gray-500">

                                No requests found.

                            </div>

                        )
                    }


                    {/* Requests */}

                    {selectedCollection &&
                        !requestLoading &&
                        !requestError &&
                        requests.length > 0 && (

                            <div className="py-2">

                                {requests.map((request) => (

                                    <RequestItem
                                        key={request.id}

                                        request={request}

                                        selected={
                                            isSelectedRequestFromCurrentCollection &&
                                                selectedRequest?.id === request.id
                                        }

                                        onClick={() =>
                                            handleRequestSelect(
                                                request.id
                                            )
                                        }
                                        onDelete={() =>
                                            handleRequestDeleteClick(
                                                request
                                            )
                                        }
                                        onDuplicate={() =>
                                            handleDuplicateRequest(
                                                request.id
                                            )
                                        }
                                        onMove={() =>
                                            handleRequestMoveClick(
                                                request
                                            )
                                        }
                                    />

                                ))}

                            </div>

                        )
                    }

                </div>

            </aside>


            {/* ==================================
                New Request Modal
            ================================== */}

            <NewRequestModal

                open={newRequestModalOpen}

                onClose={() =>
                    setNewRequestModalOpen(false)
                }

                onCreate={
                    handleCreateRequest
                }

            />

            {/* Delete Request */}
            <DeleteRequestModal
                open={
                    requestToDelete !== null
                }
                requestName={
                    requestToDelete?.name ?? ""
                }
                deleting={
                    deletingRequest
                }
                error={
                    deleteError
                }
                onCancel={() => {
                    if (!deletingRequest) {
                        setRequestToDelete(
                            null
                        );
                        setDeleteError(
                            null
                        );
                    }
                }}
                onConfirm={
                    handleDeleteRequest
                }
            />

            <MoveRequestModal
                open={
                    requestToMove !== null
                }
                requestName={
                    requestToMove?.name ?? ""
                }
                collections={
                    collections
                }
                currentCollectionId={
                    selectedCollection?.id ?? 0
                }
                moving={
                    movingRequest
                }
                error={
                    moveError
                }
                onCancel={() => {
                    if (!movingRequest) {
                        setRequestToMove(null);
                        setMoveError(null);
                    }
                }}
                onMove={
                    handleMoveRequest
                }
            />
        </>

    );
}