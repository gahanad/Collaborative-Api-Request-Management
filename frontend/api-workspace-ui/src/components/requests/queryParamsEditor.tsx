import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCollectionStore } from "../../store/CollectionStore";
import { useRequestStore } from "../../store/RequestStore";
import { useQueryParamStore } from "../../store/QueryParamStore";

import type {
    QueryParamResponse,
    CreateQueryParamRequest,
} from "../../types/queryParam";


interface QueryParamDraft {
    paramKey: string;

    paramValue: string;

    enabled: boolean;
}


export default function QueryParamsEditor() {

    const { workspaceId } = useParams();


    const {
        selectedCollection,
    } = useCollectionStore();


    const {
        selectedRequest,
    } = useRequestStore();


    const {
        queryParams,
        loading,
        error,
        fetchQueryParams,
        createQueryParam,
        updateQueryParam,
        deleteQueryParam,
    } = useQueryParamStore();


    // ==========================================
    // Local drafts
    // ==========================================

    const [
        drafts,
        setDrafts,
    ] = useState<
        Record<number, QueryParamDraft>
    >({});


    // ==========================================
    // New parameter
    // ==========================================

    const [
        newParam,
        setNewParam,
    ] = useState<QueryParamDraft>({
        paramKey: "",
        paramValue: "",
        enabled: true,
    });


    // ==========================================
    // Loading states
    // ==========================================

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
    // Fetch query params when request changes
    // ==========================================

    useEffect(() => {

        if (
            !workspaceId ||
            !selectedCollection ||
            !selectedRequest
        ) {
            return;
        }


        const workspaceIdNumber =
            Number(workspaceId);


        if (Number.isNaN(workspaceIdNumber)) {
            return;
        }


        fetchQueryParams(
            workspaceIdNumber,
            selectedCollection.id,
            selectedRequest.id
        ).catch((error) => {

            console.error(
                "Failed to load query parameters:",
                error
            );

        });

    }, [
        workspaceId,
        selectedCollection?.id,
        selectedRequest?.id,
        fetchQueryParams,
    ]);


    // ==========================================
    // Sync Store -> Local Drafts
    // ==========================================

    useEffect(() => {

        const nextDrafts:
            Record<number, QueryParamDraft> = {};


        queryParams.forEach((param) => {

            nextDrafts[param.id] = {

                paramKey:
                    param.paramKey,

                paramValue:
                    param.paramValue,

                enabled:
                    param.enabled,

            };

        });


        setDrafts(nextDrafts);

    }, [queryParams]);


    // ==========================================
    // Get request context
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

            workspaceId:
                workspaceIdNumber,

            collectionId:
                selectedCollection.id,

            requestId:
                selectedRequest.id,

        };
    };


    // ==========================================
    // Update local draft
    // ==========================================

    const updateDraft = (
        paramId: number,
        field: keyof QueryParamDraft,
        value: string | boolean
    ) => {

        setDrafts((current) => ({

            ...current,

            [paramId]: {

                ...current[paramId],

                [field]: value,

            },

        }));

    };


    // ==========================================
    // Save parameter
    // ==========================================

    const handleSave = async (
        param: QueryParamResponse
    ) => {

        const context =
            getRequestContext();


        if (!context) {
            return;
        }


        const draft =
            drafts[param.id];


        if (!draft) {
            return;
        }


        if (!draft.paramKey.trim()) {

            window.alert(
                "Parameter key is required."
            );

            return;
        }


        const data: CreateQueryParamRequest = {

            paramKey:
                draft.paramKey.trim(),

            paramValue:
                draft.paramValue,

            enabled:
                draft.enabled,

        };


        setSavingId(param.id);


        try {

            await updateQueryParam(
                context.workspaceId,
                context.collectionId,
                context.requestId,
                param.id,
                data
            );

        } catch (error) {

            console.error(
                "Failed to update query parameter:",
                error
            );

            window.alert(
                "Failed to update query parameter."
            );

        } finally {

            setSavingId(null);

        }
    };


    // ==========================================
    // Delete parameter
    // ==========================================

    const handleDelete = async (
        paramId: number
    ) => {

        const context =
            getRequestContext();


        if (!context) {
            return;
        }


        setDeletingId(paramId);


        try {

            await deleteQueryParam(
                context.workspaceId,
                context.collectionId,
                context.requestId,
                paramId
            );

        } catch (error) {

            console.error(
                "Failed to delete query parameter:",
                error
            );

            window.alert(
                "Failed to delete query parameter."
            );

        } finally {

            setDeletingId(null);

        }
    };


    // ==========================================
    // Create parameter
    // ==========================================

    const handleCreate = async () => {

        const context =
            getRequestContext();


        if (!context) {
            return;
        }


        if (!newParam.paramKey.trim()) {

            window.alert(
                "Parameter key is required."
            );

            return;
        }


        const data: CreateQueryParamRequest = {

            paramKey:
                newParam.paramKey.trim(),

            paramValue:
                newParam.paramValue,

            enabled:
                newParam.enabled,

        };


        setCreating(true);


        try {

            await createQueryParam(
                context.workspaceId,
                context.collectionId,
                context.requestId,
                data
            );


            setNewParam({
                paramKey: "",
                paramValue: "",
                enabled: true,
            });

        } catch (error) {

            console.error(
                "Failed to create query parameter:",
                error
            );

            window.alert(
                "Failed to create query parameter."
            );

        } finally {

            setCreating(false);

        }
    };


    // ==========================================
    // No request selected
    // ==========================================

    if (!selectedRequest) {

        return (

            <div className="p-5">

                <div className="rounded-lg border bg-white p-6">

                    <p className="text-sm text-gray-500">
                        Select a request to manage query parameters.
                    </p>

                </div>

            </div>

        );
    }


    return (

        <div className="space-y-4 p-5">

            {/* ==================================
                Title
            ================================== */}

            <div>

                <h3 className="text-sm font-semibold text-gray-900">
                    Query Parameters
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Configure parameters that will be appended to the request URL.
                </p>

            </div>


            {/* ==================================
                Loading
            ================================== */}

            {loading && (

                <div className="rounded-md border bg-white p-4 text-sm text-gray-500">

                    Loading query parameters...

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
                Parameters table
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
                            Existing parameters
                        ================================== */}

                        {queryParams.map((param) => {

                            const draft =
                                drafts[param.id];


                            if (!draft) {
                                return null;
                            }


                            const isSaving =
                                savingId === param.id;


                            const isDeleting =
                                deletingId === param.id;


                            return (

                                <div
                                    key={param.id}
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
                                                    param.id,
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
                                            aria-label={`Enable ${draft.paramKey || "parameter"}`}
                                        />

                                    </div>


                                    {/* Key */}

                                    <input
                                        type="text"
                                        value={
                                            draft.paramKey
                                        }
                                        onChange={(event) =>
                                            updateDraft(
                                                param.id,
                                                "paramKey",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Parameter key"
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
                                            draft.paramValue
                                        }
                                        onChange={(event) =>
                                            updateDraft(
                                                param.id,
                                                "paramValue",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Parameter value"
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
                                                    param
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
                                                    param.id
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
                            Empty state
                        ================================== */}

                        {queryParams.length === 0 && (

                            <div className="p-8 text-center">

                                <p className="text-sm text-gray-500">
                                    No query parameters added yet.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* ==================================
                Add Parameter
            ================================== */}

            <div className="rounded-lg border bg-white p-4">

                <div>

                    <h4 className="text-sm font-semibold text-gray-800">
                        Add Query Parameter
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                        Add a parameter to the request URL.
                    </p>

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
                                newParam.enabled
                            }
                            onChange={(event) =>
                                setNewParam(
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
                            aria-label="Enable new parameter"
                        />

                    </div>


                    {/* Key */}

                    <input
                        type="text"
                        value={
                            newParam.paramKey
                        }
                        onChange={(event) =>
                            setNewParam(
                                (current) => ({
                                    ...current,
                                    paramKey:
                                        event.target.value,
                                })
                            )
                        }
                        placeholder="Parameter key"
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
                            newParam.paramValue
                        }
                        onChange={(event) =>
                            setNewParam(
                                (current) => ({
                                    ...current,
                                    paramValue:
                                        event.target.value,
                                })
                            )
                        }
                        placeholder="Parameter value"
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