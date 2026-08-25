import type { RequestSummary } from "../../types/request";


interface RequestItemProps {
    request: RequestSummary;
    selected: boolean;
    onClick: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMove: ()=> void;
}


function getMethodClass(
    method: string
): string {

    switch (method) {

        case "GET":
            return "text-green-600";

        case "POST":
            return "text-blue-600";

        case "PUT":
            return "text-orange-600";

        case "PATCH":
            return "text-purple-600";

        case "DELETE":
            return "text-red-600";

        case "HEAD":
            return "text-gray-600";

        case "OPTIONS":
            return "text-gray-600";

        default:
            return "text-gray-600";
    }
}


export default function RequestItem({
    request,
    selected,
    onClick,
    onDelete,
    onDuplicate,
    onMove
}: RequestItemProps) {

    return (

        <div
            className={`
                group
                flex
                w-full
                items-center
                gap-2
                px-3
                py-2
                transition
                ${
                    selected
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                }
            `}
        >

            {/* ==================================
                Request Selection
            ================================== */}

            <button
                type="button"
                onClick={onClick}
                className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-3
                    text-left
                "
            >

                {/* HTTP Method */}

                <span
                    className={`
                        w-14
                        shrink-0
                        text-xs
                        font-bold
                        ${getMethodClass(request.method)}
                    `}
                >
                    {request.method}
                </span>


                {/* Request Name */}

                <span
                    className="
                        min-w-0
                        truncate
                        text-sm
                        text-gray-800
                    "
                    title={request.name}
                >
                    {request.name}
                </span>

            </button>


            {/* ==================================
                Request Actions
            ================================== */}

            <div
                className="
                    flex
                    shrink-0
                    items-center
                    gap-1
                "
            >

                {/* Duplicate */}

                <button
                    type="button"
                    onClick={(event) => {

                        event.stopPropagation();

                        onDuplicate();

                    }}
                    title="Duplicate request"
                    aria-label={`Duplicate ${request.name}`}
                    className="
                        rounded
                        px-1.5
                        py-1
                        text-xs
                        text-gray-500
                        opacity-0
                        transition
                        hover:bg-white
                        hover:text-gray-800
                        group-hover:opacity-100
                        focus:opacity-100
                    "
                >
                    ⧉
                </button>

                <button
                    type="button"
                    onClick={(event) => {

                        event.stopPropagation();

                        onMove();

                    }}
                    title="Move request"
                    aria-label={
                        `Move ${request.name}`
                    }
                    className="
                        rounded
                        px-1.5
                        py-1
                        text-xs
                        text-gray-500
                        opacity-0
                        transition
                        hover:bg-white
                        hover:text-gray-800
                        group-hover:opacity-100
                        focus:opacity-100
                    "
                >
                    ↗
                </button>


                {/* Delete */}

                <button
                    type="button"
                    onClick={(event) => {

                        event.stopPropagation();

                        onDelete();

                    }}
                    title="Delete request"
                    aria-label={`Delete ${request.name}`}
                    className="
                        rounded
                        px-1.5
                        py-1
                        text-xs
                        text-red-500
                        opacity-0
                        transition
                        hover:bg-white
                        hover:text-red-700
                        group-hover:opacity-100
                        focus:opacity-100
                    "
                >
                    ×
                </button>

            </div>

        </div>
    );
}