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


function getActionClass(
    action: string
): string {

    switch (action) {

        case "CREATED":
            return "text-green-600";

        case "UPDATED":
            return "text-blue-600";

        case "DELETED":
            return "text-red-600";

        case "EXECUTED":
            return "text-purple-600";

        case "RUN_COLLECTION":
            return "text-orange-600";

        default:
            return "text-gray-600";
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
            className="
                flex
                h-full
                min-h-0
                flex-col
                bg-gray-50
            "
        >

            {/* ==================================
                Header
            ================================== */}

            <div
                className="
                    flex
                    shrink-0
                    flex-wrap
                    items-center
                    gap-3
                    border-b
                    bg-white
                    px-5
                    py-3
                "
            >
                <div>

                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-gray-900
                        "
                    >
                        Workspace Activity
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-gray-500
                        "
                    >
                        Recent actions performed
                        in this workspace.
                    </p>

                </div>


                <span
                    className="
                        rounded-full
                        bg-gray-100
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-gray-600
                    "
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
                className="
                    flex
                    shrink-0
                    flex-wrap
                    items-center
                    gap-3
                    border-b
                    bg-white
                    px-5
                    py-3
                "
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
                        className="
                            text-xs
                            font-medium
                            text-gray-500
                        "
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
                        className="
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-1.5
                            text-xs
                            text-gray-700
                            outline-none
                            focus:border-gray-500
                        "
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
                        className="
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-1.5
                            text-xs
                            text-gray-700
                            outline-none
                            focus:border-gray-500
                        "
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
                    className="
                        rounded-md
                        border
                        border-gray-300
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-gray-600
                        hover:bg-gray-50
                    "
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
                    className="
                        rounded-md
                        border
                        border-gray-300
                        bg-white
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-gray-700
                        hover:bg-gray-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
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
                            className="
                                divide-y
                                divide-gray-200
                                bg-white
                            "
                        >

                            {activities.map(
                                (activity) => (

                                <div
                                    key={activity.id}
                                    className="
                                        px-5
                                        py-4
                                        transition
                                        hover:bg-gray-50
                                    "
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
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-gray-800
                                                    "
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
                        className="
                            flex
                            shrink-0
                            items-center
                            justify-between
                            border-t
                            bg-white
                            px-5
                            py-3
                        "
                    >

                        {/* ==================================
                            Page Information
                        ================================== */}

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
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
                                className="
                                    rounded-md
                                    border
                                    border-gray-300
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-medium
                                    text-gray-700
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
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
                                className="
                                    rounded-md
                                    border
                                    border-gray-300
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-medium
                                    text-gray-700
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
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