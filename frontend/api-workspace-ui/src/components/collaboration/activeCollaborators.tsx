import {
    useCollaborationStore,
} from "../../store/CollaborationStore";


export default function ActiveCollaborators() {

    const {
        activeCollaborators,
        connected,
        error,
    } = useCollaborationStore();


    return (

        <div
            className="
                flex
                flex-col
                gap-2
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >

                {/* ==================================
                    Connection Status
                ================================== */}

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-gray-500
                    "
                >

                    <span
                        className={`
                            h-2
                            w-2
                            rounded-full
                            ${
                                connected
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                            }
                        `}
                    />

                    {connected
                        ? "Connected"
                        : "Reconnecting..."}
                </div>


                {/* ==================================
                    Collaborators
                ================================== */}

                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >

                    {activeCollaborators
                        .slice(0, 5)
                        .map(
                            (collaborator) => (

                                <div
                                    key={
                                        collaborator.userId
                                    }
                                    title={
                                        collaborator.userName
                                    }
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-gray-800
                                        text-xs
                                        font-medium
                                        text-white
                                    "
                                >

                                    {
                                        collaborator
                                            .userName
                                            .charAt(0)
                                            .toUpperCase()
                                    }

                                </div>
                            )
                        )
                    }


                    {activeCollaborators.length > 5 && (

                        <div
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                bg-gray-200
                                text-xs
                                font-medium
                                text-gray-600
                            "
                        >

                            +
                            {activeCollaborators.length - 5}

                        </div>
                    )}

                </div>


                {/* ==================================
                    Count
                ================================== */}

                <span
                    className="
                        text-xs
                        text-gray-500
                    "
                >

                    {activeCollaborators.length}

                    {" "}

                    {
                        activeCollaborators.length === 1
                            ? "collaborator"
                            : "collaborators"
                    }

                </span>

            </div>


            {/* ==================================
                Error
            ================================== */}

            {error && (

                <div
                    className="
                        rounded-md
                        border
                        border-red-200
                        bg-red-50
                        px-3
                        py-2
                        text-xs
                        text-red-600
                    "
                >

                    Collaboration connection issue.
                    Retrying automatically...

                </div>

            )}

        </div>
    );
}