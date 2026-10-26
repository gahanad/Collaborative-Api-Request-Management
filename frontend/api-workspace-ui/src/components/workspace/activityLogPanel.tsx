import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useActivityLogStore } from "../../store/ActivityStore";

import type {
    ActivityAction,
    ResourceType,
} from "../../types/activity";


// ==========================================
// Helpers
// ==========================================

function getActionLabel(
    action: string
): string {

    switch (action) {

        case "CREATED":
            return "Created";

        case "UPDATED":
            return "Updated";

        case "DELETED":
            return "Deleted";

        case "EXECUTED":
            return "Executed";

        case "RUN_COLLECTION":
            return "Ran collection";

        default:
            return action;
    }
}


function getActionClass(action: string): string {
    switch (action) {
        case "CREATED":
            return "text-emerald-400";
        case "UPDATED":
            return "text-sky-400";
        case "DELETED":
            return "text-rose-400";
        case "EXECUTED":
            return "text-violet-300";
        case "RUN_COLLECTION":
            return "text-amber-400";
        default:
            return "text-[#C1B3D1]";
    }
}


function formatDate(
    date: string
): string {

    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;
    }


    return parsedDate.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );
}


// ==========================================
// Activity Log Panel
// ==========================================

export default function ActivityLogPanel() {

    const {
        workspaceId,
    } = useParams();

    const {
        activities,
        loading,
        error,

        page,
        totalPages,
        totalElements,
        first,
        last,

        action,
        resourceType,

        fetchActivity,
        setAction,
        setResourceType,
        resetFilters,
        refreshActivity
    } = useActivityLogStore();


    // ==========================================
    // Load Activity
    // ==========================================

    useEffect(() => {

        if (!workspaceId) {
            return;
        }

        fetchActivity(
            Number(workspaceId),
            0
        );

    }, [
        workspaceId,
    ]);


    // ==========================================
    // Invalid Workspace
    // ==========================================

    if (!workspaceId) {

        return (

            <div
                className="
                    flex
                    h-full
                    items-center
                    justify-center
                    p-6
                "
            >

                <p
                    className="
                        text-sm
                        text-gray-500
                    "
                >
                    Workspace not found.
                </p>

            </div>

        );
    }


    // ==========================================
    // Render
    // ==========================================

    return (

        <section
            className="flex h-full min-h-0 flex-col bg-[#100B1B] text-[#F5F0FF]"
        >

            {/* ==================================
                Header
            ================================== */}

            <div
                className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#3B2B4D] bg-[#191123]/95 px-5 py-4"
            >
                <div>

                    <h2
                        className="text-lg font-semibold text-[#F5F0FF]"
                    >
                        Workspace Activity
                    </h2>

                    <p
                        className="mt-1 text-xs text-[#B9A9CB]"
                    >
                        Recent actions performed
                        in this workspace.
                    </p>

                </div>


                <span
                    className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300"
                >
                    {activities.length}
                    {" "}
                    {activities.length === 1
                        ? "activity"
                        : "activities"
                    }
                </span>

            </div>

            {/* Filtering */}

            {/* ==================================
                Filters
            ================================== */}

            <div
                className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#3B2B4D] bg-[#191123]/80 px-5 py-3"
            >

                {/* ==================================
                    Action Filter
                ================================== */}

                <label
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="text-xs font-medium text-[#B9A9CB]"
                    >
                        Action
                    </span>


                    <select
                        value={action}
                        onChange={(event) => {
                            const value =
                                event.target.value as ActivityAction | "";
                            setAction(value);

                        }}
                        className="rounded-lg border border-[#49365E] bg-[#21172F] px-3 py-2 text-xs text-[#F5F0FF] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                    >

                        <option value="">
                            All actions
                        </option>

                        <option value="CREATED">
                            Created
                        </option>

                        <option value="UPDATED">
                            Updated
                        </option>

                        <option value="DELETED">
                            Deleted
                        </option>

                        <option value="EXECUTED">
                            Executed
                        </option>

                        <option value="RUN_COLLECTION">
                            Run collection
                        </option>

                    </select>

                </label>


                {/* ==================================
                    Resource Filter
                ================================== */}

                <label
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            text-xs
                            font-medium
                            text-gray-500
                        "
                    >
                        Resource
                    </span>


                    <select
                        value={resourceType}
                        onChange={(event) => {

                            const value =
                                event.target.value as ResourceType | "";

                            setResourceType(value);

                        }}
                        className="rounded-md border border-[#49365E] bg-[#241831] px-2 py-0.5 text-[11px] font-medium text-[#C4A5FF]"
                    >

                        <option value="">
                            All resources
                        </option>

                        <option value="WORKSPACE">
                            Workspace
                        </option>

                        <option value="COLLECTION">
                            Collection
                        </option>

                        <option value="REQUEST">
                            Request
                        </option>

                        <option value="ENVIRONMENT">
                            Environment
                        </option>

                        <option value="VARIABLE">
                            Variable
                        </option>

                    </select>

                </label>


                {/* ==================================
                    Clear Filters
                ================================== */}

                <button
                    type="button"
                    onClick={() => {

                        resetFilters();


                        if (workspaceId) {

                            fetchActivity(
                                Number(workspaceId),
                                0
                            );

                        }

                    }}
                    className="rounded-lg border border-[#49365E] px-3 py-2 text-xs font-medium text-[#C1B3D1] transition hover:border-violet-400/50 hover:bg-[#2D2040] hover:text-white"
                >
                    Clear Filters
                </button>

            </div>

            <div>
                <button
                    type="button"
                    onClick={() => {

                        if (!workspaceId) {
                            return;
                        }

                        refreshActivity(
                            Number(workspaceId)
                        );

                    }}
                    disabled={loading}
                    className="rounded-lg border border-[#49365E] bg-[#241831] px-3 py-2 text-xs font-medium text-[#E5D8F5] transition hover:border-violet-400/50 hover:bg-[#30203F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>


            {/* ==================================
                Loading
            ================================== */}

            {loading && (

                <div
                    className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        p-6
                    "
                >

                    <div className="text-center">

                        <div
                            className="
                                mx-auto
                                mb-3
                                h-6
                                w-6
                                animate-spin
                                rounded-full
                                border-2
                                border-gray-300
                                border-t-gray-700
                            "
                        />

                        <p
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            Loading activity...
                        </p>

                    </div>

                </div>

            )}


            {/* ==================================
                Error
            ================================== */}

            {!loading && error && (

                <div
                    className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        p-6
                    "
                >

                    <div className="text-center">

                        <p
                            className="
                                text-sm
                                font-medium
                                text-red-600
                            "
                        >
                            Failed to load activity.
                        </p>


                        <p
                            className="
                                mt-1
                                max-w-md
                                text-xs
                                text-gray-500
                            "
                        >
                            {error}
                        </p>


                        <button
                            type="button"
                            onClick={() => {

                                const id =
                                    Number(
                                        workspaceId
                                    );


                                if (
                                    !Number.isNaN(id)
                                ) {

                                    fetchActivity(id);

                                }

                            }}
                            className="
                                mt-4
                                rounded-md
                                bg-gray-900
                                px-4
                                py-2
                                text-xs
                                font-medium
                                text-white
                                hover:bg-gray-800
                            "
                        >
                            Retry
                        </button>

                    </div>

                </div>

            )}


            {/* ==================================
                Empty
            ================================== */}

            {!loading &&
                !error &&
                activities.length === 0 && (

                <div
                    className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        p-6
                    "
                >

                    <div className="text-center">

                        <div
                            className="
                                mb-3
                                text-4xl
                                text-gray-300
                            "
                        >
                            ◷
                        </div>


                        <h3
                            className="
                                text-sm
                                font-semibold
                                text-gray-700
                            "
                        >
                            No activity yet
                        </h3>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            Actions performed in this
                            workspace will appear here.
                        </p>

                    </div>

                </div>

            )}


            {/* ==================================
                Activity List
            ================================== */}

            {!loading &&
                !error &&
                activities.length > 0 && (
                <>

                    <div
                        className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                        "
                    >

                        <div
                            className="divide-y divide-[#352542] bg-[#171122]"
                        >

                            {activities.map(
                                (activity) => (

                                <div
                                    key={activity.id}
                                    className="px-5 py-4 transition-colors hover:bg-[#21172F]/80"
                                >

                                    <div
                                        className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-4
                                        "
                                    >

                                        {/* Activity Information */}

                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                {/* User */}

                                                <span
                                                    className="text-sm font-semibold text-[#F5F0FF]"
                                                >
                                                    {
                                                        activity.userName
                                                    }
                                                </span>


                                                {/* Action */}

                                                <span
                                                    className={`
                                                        text-sm
                                                        font-medium
                                                        ${getActionClass(
                                                            activity.action
                                                        )}
                                                    `}
                                                >
                                                    {
                                                        getActionLabel(
                                                            activity.action
                                                        )
                                                    }
                                                </span>


                                                {/* Resource Type */}

                                                <span
                                                    className="
                                                        rounded
                                                        bg-gray-100
                                                        px-2
                                                        py-0.5
                                                        text-[11px]
                                                        font-medium
                                                        text-gray-500
                                                    "
                                                >
                                                    {
                                                        activity.resourceType
                                                    }
                                                </span>

                                            </div>


                                            {/* Resource Name */}

                                            <p
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-sm
                                                    text-gray-700
                                                "
                                                title={
                                                    activity.resourceName
                                                }
                                            >
                                                {activity.resourceName}
                                            </p>

                                        </div>


                                        {/* Timestamp */}

                                        <time
                                            className="
                                                shrink-0
                                                text-xs
                                                text-gray-400
                                            "
                                            dateTime={
                                                activity.createdAt
                                            }
                                        >
                                            {
                                                formatDate(
                                                    activity.createdAt
                                                )
                                            }
                                        </time>

                                    </div>

                                </div>
                                

                            ))}

                        </div>

                    </div>

                {/* Pagination */}
                {/* ==================================
                        Pagination
                    ================================== */}

                    <div
                        className="flex shrink-0 items-center justify-between gap-3 border-t border-[#3B2B4D] bg-[#191123] px-5 py-3"
                    >

                        {/* ==================================
                            Page Information
                        ================================== */}

                        <p
                            className="text-xs text-[#B9A9CB]"
                        >
                            Page {page + 1} of {totalPages}
                            {" · "}
                            {totalElements} activities
                        </p>


                        {/* ==================================
                            Buttons
                        ================================== */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            {/* Previous */}

                            <button
                                type="button"
                                disabled={
                                    first ||
                                    loading
                                }
                                onClick={() => {

                                    if (!workspaceId) {
                                        return;
                                    }


                                    fetchActivity(
                                        Number(workspaceId),
                                        page - 1
                                    );

                                }}
                                className="rounded-lg border border-[#49365E] bg-[#241831] px-3 py-2 text-xs font-medium text-[#E5D8F5] transition hover:border-violet-400/50 hover:bg-[#30203F] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>


                            {/* Next */}

                            <button
                                type="button"
                                disabled={
                                    last ||
                                    loading
                                }
                                onClick={() => {

                                    if (!workspaceId) {
                                        return;
                                    }


                                    fetchActivity(
                                        Number(workspaceId),
                                        page + 1
                                    );

                                }}
                                className="rounded-lg border border-[#49365E] bg-[#241831] px-3 py-2 text-xs font-medium text-[#E5D8F5] transition hover:border-violet-400/50 hover:bg-[#30203F] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>

                        </div>

                    </div>
                </>

            )}

        </section>
    );
}