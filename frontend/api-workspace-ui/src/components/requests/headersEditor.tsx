import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCollectionStore } from "../../store/CollectionStore";
import { useRequestStore } from "../../store/RequestStore";
import { useHeaderStore } from "../../store/HeaderStore";

import type {
    HeaderResponse,
    CreateHeaderRequest,
} from "../../types/header";


interface HeaderDraft {
    headerKey: string;
    headerValue: string;
    enabled: boolean;
}


export default function HeadersEditor() {

    const { workspaceId } = useParams();


    const {
        selectedCollection,
    } = useCollectionStore();


    const {
        selectedRequest,
    } = useRequestStore();


    const {
        headers,
        loading,
        error,
        createHeader,
        updateHeader,
        deleteHeader,
    } = useHeaderStore();


    const [drafts, setDrafts] = useState<
        Record<number, HeaderDraft>
    >({});


    const [
        newHeader,
        setNewHeader,
    ] = useState<HeaderDraft>({
        headerKey: "",
        headerValue: "",
        enabled: true,
    });


    const [
        savingId,
        setSavingId,
    ] = useState<number | null>(null);


    const [
        deletingId,
        setDeletingId,
    ] = useState<number | null>(null);


    const [
        creating,
        setCreating,
    ] = useState(false);


    // ==========================================
    // Sync Store -> Local Drafts
    // ==========================================

    useEffect(() => {

        const nextDrafts:
            Record<number, HeaderDraft> = {};

        headers.forEach((header) => {

            nextDrafts[header.id] = {
                headerKey: header.headerKey,
                headerValue: header.headerValue,
                enabled: header.enabled,
            };

        });

        setDrafts(nextDrafts);

    }, [headers]);


    // ==========================================
    // Update Local Draft
    // ==========================================

    const updateDraft = (
        headerId: number,
        field: keyof HeaderDraft,
        value: string | boolean
    ) => {

        setDrafts((current) => ({

            ...current,

            [headerId]: {

                ...current[headerId],

                [field]: value,

            },

        }));

    };


    // ==========================================
    // Validate Context
    // ==========================================

    const getRequestContext = () => {

        if (
            !workspaceId ||
            !selectedCollection ||
            !selectedRequest
        ) {
            return null;
        }

        const workspaceIdNumber =
            Number(workspaceId);

        if (Number.isNaN(workspaceIdNumber)) {
            return null;
        }

        return {
            workspaceId: workspaceIdNumber,
            collectionId:
                selectedCollection.id,
            requestId:
                selectedRequest.id,
        };

    };


    // ==========================================
    // Save Header
    // ==========================================

    const handleSave = async (
        header: HeaderResponse
    ) => {

        const context =
            getRequestContext();

        if (!context) {
            return;
        }


        const draft =
            drafts[header.id];

        if (!draft) {
            return;
        }


        if (!draft.headerKey.trim()) {

            window.alert(
                "Header key is required."
            );

            return;
        }


        const data: CreateHeaderRequest = {

            headerKey:
                draft.headerKey.trim(),

            headerValue:
                draft.headerValue,

            enabled:
                draft.enabled,

        };


        setSavingId(header.id);

        try {

            await updateHeader(
                context.workspaceId,
                context.collectionId,
                context.requestId,
                header.id,
                data
            );

        } catch (error) {

            console.error(
                "Failed to update header:",
                error
            );

            window.alert(
                "Failed to update header."
            );

        } finally {

            setSavingId(null);

        }
    };


    // ==========================================
    // Delete Header
    // ==========================================

    const handleDelete = async (
        headerId: number
    ) => {

        const context =
            getRequestContext();

        if (!context) {
            return;
        }


        setDeletingId(headerId);

        try {

            await deleteHeader(
                context.workspaceId,
                context.collectionId,
                context.requestId,
                headerId
            );

        } catch (error) {

            console.error(
                "Failed to delete header:",
                error
            );

            window.alert(
                "Failed to delete header."
            );

        } finally {

            setDeletingId(null);

        }
    };


    // ==========================================
    // Create Header
    // ==========================================

    const handleCreate = async () => {

        const context =
            getRequestContext();

        if (!context) {
            return;
        }


        if (!newHeader.headerKey.trim()) {

            window.alert(
                "Header key is required."
            );

            return;
        }


        const data: CreateHeaderRequest = {

            headerKey:
                newHeader.headerKey.trim(),

            headerValue:
                newHeader.headerValue,

            enabled:
                newHeader.enabled,

        };


        setCreating(true);

        try {

            await createHeader(
                context.workspaceId,
                context.collectionId,
                context.requestId,
                data
            );


            // Reset form

            setNewHeader({
                headerKey: "",
                headerValue: "",
                enabled: true,
            });

        } catch (error) {

            console.error(
                "Failed to create header:",
                error
            );

            window.alert(
                "Failed to create header."
            );

        } finally {

            setCreating(false);

        }
    };


    // ==========================================
    // No Request
    // ==========================================

    if (!selectedRequest) {

        return (

            <div className="p-5">

                <div className="rounded-lg border bg-white p-6">

                    <p className="text-sm text-gray-500">
                        Select a request to manage headers.
                    </p>

                </div>

            </div>

        );
    }


    return (

        <div className="space-y-4 p-5">

            {/* ==================================
                Header Title
            ================================== */}

            <div>

                <h3 className="text-sm font-semibold text-gray-900">
                    Headers
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Configure HTTP headers for this request.
                </p>

            </div>


            {/* ==================================
                Loading
            ================================== */}

            {loading && (

                <div className="rounded-md border bg-white p-4 text-sm text-gray-500">

                    Loading headers...

                </div>

            )}


            {/* ==================================
                Error
            ================================== */}

            {!loading && error && (

                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">

                    {error}

                </div>

            )}


            {/* ==================================
                Header Table
            ================================== */}

            {!loading && !error && (

                <div className="overflow-x-auto rounded-lg border bg-white">

                    <div className="`min-w-[700px]`">

                        {/* Table Header */}

                        <div
                            className="
                                grid
                                grid-cols-[48px_minmax(180px,1fr)_minmax(220px,1.5fr)_150px]
                                items-center
                                gap-2
                                border-b
                                bg-gray-50
                                px-3
                                py-2
                            "
                        >

                            <div />

                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Key
                            </div>

                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Value
                            </div>

                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Actions
                            </div>

                        </div>


                        {/* ==================================
                            Existing Headers
                        ================================== */}

                        {headers.map((header) => {

                            const draft =
                                drafts[header.id];

                            if (!draft) {
                                return null;
                            }


                            const isSaving =
                                savingId === header.id;

                            const isDeleting =
                                deletingId === header.id;


                            return (

                                <div
                                    key={header.id}
                                    className="
                                        grid
                                        grid-cols-[48px_minmax(180px,1fr)_minmax(220px,1.5fr)_150px]
                                        items-center
                                        gap-2
                                        border-b
                                        px-3
                                        py-2
                                        last:border-b-0
                                    "
                                >

                                    {/* Enabled */}

                                    <div className="flex justify-center">

                                        <input
                                            type="checkbox"
                                            checked={
                                                draft.enabled
                                            }
                                            onChange={(event) =>
                                                updateDraft(
                                                    header.id,
                                                    "enabled",
                                                    event.target.checked
                                                )
                                            }
                                            className="
                                                h-4
                                                w-4
                                                rounded
                                                border-gray-300
                                                text-blue-600
                                                focus:ring-blue-500
                                            "
                                            aria-label={`Enable ${draft.headerKey || "header"}`}
                                        />

                                    </div>


                                    {/* Key */}

                                    <input
                                        type="text"
                                        value={
                                            draft.headerKey
                                        }
                                        onChange={(event) =>
                                            updateDraft(
                                                header.id,
                                                "headerKey",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Header key"
                                        className="
                                            h-9
                                            w-full
                                            rounded-md
                                            border
                                            border-gray-300
                                            px-3
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                        "
                                    />


                                    {/* Value */}

                                    <input
                                        type="text"
                                        value={
                                            draft.headerValue
                                        }
                                        onChange={(event) =>
                                            updateDraft(
                                                header.id,
                                                "headerValue",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Header value"
                                        className="
                                            h-9
                                            w-full
                                            rounded-md
                                            border
                                            border-gray-300
                                            px-3
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                        "
                                    />


                                    {/* Actions */}

                                    <div className="flex items-center gap-2">

                                        <button
                                            type="button"
                                            disabled={
                                                isSaving ||
                                                isDeleting
                                            }
                                            onClick={() =>
                                                handleSave(
                                                    header
                                                )
                                            }
                                            className="
                                                rounded-md
                                                bg-blue-600
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-medium
                                                text-white
                                                hover:bg-blue-700
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >

                                            {isSaving
                                                ? "Saving..."
                                                : "Save"
                                            }

                                        </button>


                                        <button
                                            type="button"
                                            disabled={
                                                isSaving ||
                                                isDeleting
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    header.id
                                                )
                                            }
                                            className="
                                                rounded-md
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-medium
                                                text-red-600
                                                hover:bg-red-50
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >

                                            {isDeleting
                                                ? "Deleting..."
                                                : "Delete"
                                            }

                                        </button>

                                    </div>

                                </div>

                            );

                        })}


                        {/* ==================================
                            Empty State
                        ================================== */}

                        {headers.length === 0 && (

                            <div className="p-8 text-center">

                                <p className="text-sm text-gray-500">
                                    No headers added yet.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* ==================================
                Add Header
            ================================== */}

            <div className="rounded-lg border bg-white p-4">

                <div className="flex items-center justify-between">

                    <div>

                        <h4 className="text-sm font-semibold text-gray-800">
                            Add Header
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                            Add a new HTTP header.
                        </p>

                    </div>

                </div>


                <div
                    className="
                        mt-4
                        grid
                        grid-cols-[48px_minmax(180px,1fr)_minmax(220px,1.5fr)_100px]
                        items-center
                        gap-2
                    "
                >

                    {/* Enabled */}

                    <div className="flex justify-center">

                        <input
                            type="checkbox"
                            checked={
                                newHeader.enabled
                            }
                            onChange={(event) =>
                                setNewHeader(
                                    (current) => ({
                                        ...current,
                                        enabled:
                                            event.target.checked,
                                    })
                                )
                            }
                            className="
                                h-4
                                w-4
                                rounded
                                border-gray-300
                                text-blue-600
                                focus:ring-blue-500
                            "
                            aria-label="Enable new header"
                        />

                    </div>


                    {/* Key */}

                    <input
                        type="text"
                        value={
                            newHeader.headerKey
                        }
                        onChange={(event) =>
                            setNewHeader(
                                (current) => ({
                                    ...current,
                                    headerKey:
                                        event.target.value,
                                })
                            )
                        }
                        placeholder="Header key"
                        className="
                            h-9
                            w-full
                            rounded-md
                            border
                            border-gray-300
                            px-3
                            text-sm
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                        "
                    />


                    {/* Value */}

                    <input
                        type="text"
                        value={
                            newHeader.headerValue
                        }
                        onChange={(event) =>
                            setNewHeader(
                                (current) => ({
                                    ...current,
                                    headerValue:
                                        event.target.value,
                                })
                            )
                        }
                        placeholder="Header value"
                        className="
                            h-9
                            w-full
                            rounded-md
                            border
                            border-gray-300
                            px-3
                            text-sm
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                        "
                    />


                    {/* Add */}

                    <button
                        type="button"
                        disabled={creating}
                        onClick={handleCreate}
                        className="
                            rounded-md
                            bg-blue-600
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {creating
                            ? "Adding..."
                            : "Add"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}