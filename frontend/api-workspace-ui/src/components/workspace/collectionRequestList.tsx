
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";

import { useCollectionStore } from "../../store/CollectionStore";
import { useRequestStore } from "../../store/RequestStore";
import { useHeaderStore } from "../../store/HeaderStore";
import { useQueryParamStore } from "../../store/QueryParamStore";
import { useHistoryStore } from "../../store/HistoryStore";

import type { CollectionSummary } from "../../types/collection";
import type { CreateRequestRequest, RequestSummary } from "../../types/request";

import RequestItem from "./requestItem";
import NewRequestModal from "../requests/newRequestModal";
import DeleteRequestModal from "../requests/deleteRequestModal";
import MoveRequestModal from "../requests/moveRequestModal";

interface CollectionRequestListProps {
  collection: CollectionSummary;
}

export default function CollectionRequestList({
  collection,
}: CollectionRequestListProps) {
  const { workspaceId } = useParams();
  const workspaceIdNumber = Number(workspaceId);

  const { collections, selectCollection } =
    useCollectionStore();

  const {
    requestsByCollection,
    selectedRequest,
    fetchRequests,
    fetchRequestById,
    createRequest,
    deleteRequest,
    duplicateRequest,
    moveRequest,
  } = useRequestStore();

  const { fetchHeaders, clearHeaders } = useHeaderStore();
  const { fetchQueryParams, clearQueryParams } = useQueryParamStore();
  const { fetchHistory, clearHistoryState } = useHistoryStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] =
    useState<RequestSummary | null>(null);
  const [requestToMove, setRequestToMove] =
    useState<RequestSummary | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const requests = requestsByCollection[collection.id] ?? [];

  const refreshRequests = async () => {
    if (!workspaceId || !Number.isFinite(workspaceIdNumber)) return;

    setLoading(true);
    setError(null);

    try {
      await fetchRequests(workspaceIdNumber, collection.id);
    } catch {
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshRequests();
    // Each mounted list belongs to a specific collection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, collection.id]);

  const handleSelectRequest = async (requestId: number) => {
    if (!Number.isFinite(workspaceIdNumber)) return;

    selectCollection(collection);
    clearHeaders();
    clearQueryParams();
    clearHistoryState();

    try {
      await fetchRequestById(
        workspaceIdNumber,
        collection.id,
        requestId,
      );

      await Promise.all([
        fetchHeaders(workspaceIdNumber, collection.id, requestId),
        fetchQueryParams(workspaceIdNumber, collection.id, requestId),
        fetchHistory(workspaceIdNumber, collection.id, requestId),
      ]);
    } catch (err) {
      console.error("Failed to select request:", err);
    }
  };

  const handleCreateRequest = async (request: CreateRequestRequest) => {
    if (!Number.isFinite(workspaceIdNumber)) return;

    const created = await createRequest(
      workspaceIdNumber,
      collection.id,
      request,
    );

    if (!created) {
      throw new Error("Failed to create request.");
    }

    await refreshRequests();

    await Promise.all([
      fetchHeaders(workspaceIdNumber, collection.id, created.id),
      fetchQueryParams(workspaceIdNumber, collection.id, created.id),
    ]);

    setNewModalOpen(false);
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete || !Number.isFinite(workspaceIdNumber)) return;

    setDeleting(true);
    setActionError(null);

    try {
      await deleteRequest(
        workspaceIdNumber,
        collection.id,
        requestToDelete.id,
      );

      await refreshRequests();
      setRequestToDelete(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete request.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicateRequest = async (requestId: number) => {
    if (!Number.isFinite(workspaceIdNumber)) return;

    try {
      const duplicated = await duplicateRequest(
        workspaceIdNumber,
        collection.id,
        requestId,
      );

      if (duplicated) {
        await refreshRequests();
      }
    } catch (err) {
      console.error("Failed to duplicate request:", err);
    }
  };

  const handleMoveRequest = async (targetCollectionId: number) => {
    if (!requestToMove || !Number.isFinite(workspaceIdNumber)) return;

    setMoving(true);
    setActionError(null);

    try {
      await moveRequest(
        workspaceIdNumber,
        collection.id,
        requestToMove.id,
        targetCollectionId,
      );

      await refreshRequests();
      setRequestToMove(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to move request.",
      );
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="ml-5 border-l border-[#eee5f7] pl-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[10px] font-medium text-[#a293b0]">
          {requests.length} {requests.length === 1 ? "request" : "requests"}
        </span>

        <button
          type="button"
          title={`Add request to ${collection.name}`}
          aria-label={`Add request to ${collection.name}`}
          onClick={() => {
            selectCollection(collection);
            setNewModalOpen(true);
          }}
          className="rounded-md p-1 text-[#9885a9] transition hover:bg-violet-100 hover:text-violet-700"
        >
          <Plus size={14} />
        </button>
      </div>

      {loading && (
        <p className="px-3 py-2 text-xs text-[#9b8aaa]">
          Loading requests...
        </p>
      )}

      {!loading && error && (
        <div className="px-3 py-2 text-xs text-rose-600">
          {error}
          <button
            type="button"
            className="ml-2 font-semibold underline"
            onClick={() => void refreshRequests()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <p className="px-3 py-2 text-xs text-[#a293b0]">
          No requests yet.
        </p>
      )}

      {!loading &&
        !error &&
        requests.map((request) => (
          <RequestItem
            key={request.id}
            request={request}
            isSelected={
              selectedRequest?.collection.id === collection.id &&
              selectedRequest?.id === request.id
            }
            onClick={() => void handleSelectRequest(request.id)}
            onDelete={() => {
              setActionError(null);
              setRequestToDelete(request);
            }}
            onDuplicate={() => void handleDuplicateRequest(request.id)}
            onMove={() => {
              setActionError(null);
              setRequestToMove(request);
            }}
          />
        ))}

      {actionError && (
        <p className="mx-2 my-1 text-xs text-rose-600">{actionError}</p>
      )}

      <NewRequestModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreate={handleCreateRequest}
      />

      <DeleteRequestModal
        open={requestToDelete !== null}
        requestName={requestToDelete?.name ?? ""}
        deleting={deleting}
        error={actionError}
        onCancel={() => {
          if (!deleting) {
            setRequestToDelete(null);
            setActionError(null);
          }
        }}
        onConfirm={handleDeleteRequest}
      />

      <MoveRequestModal
        open={requestToMove !== null}
        requestName={requestToMove?.name ?? ""}
        collections={collections}
        currentCollectionId={collection.id}
        moving={moving}
        error={actionError}
        onCancel={() => {
          if (!moving) {
            setRequestToMove(null);
            setActionError(null);
          }
        }}
        onMove={handleMoveRequest}
      />
    </div>
  );
}
