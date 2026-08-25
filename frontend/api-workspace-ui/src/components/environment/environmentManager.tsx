import { useState } from "react";

import EnvironmentSelector
    from "./environmentSelector";

import EnvironmentVariables
    from "./environmentVariables";

import CreateEnvironmentModal
    from "./createEnvironmentModal";


export default function EnvironmentManager() {

    const [
        createModalOpen,
        setCreateModalOpen,
    ] = useState(false);


    return (

        <div
            className="
                flex
                h-full
                flex-col
                bg-gray-50
            "
        >

            {/* ==================================
                Environment Selector
            ================================== */}

            <div
                className="
                    flex
                    h-full
                    w-80
                    shrink-0
                    flex-col
                    border-r
                    bg-gray-50
                "
            >

                <EnvironmentSelector />


                {/* Create Environment */}

                <button
                    type="button"
                    onClick={() =>
                        setCreateModalOpen(true)
                    }
                    className="
                        rounded-md
                        bg-gray-900
                        px-2
                        py-1
                        text-sm
                        font-sm
                        text-white
                        hover:bg-gray-800
                    "
                >
                    + Create Environment
                </button>

            </div>


            {/* ==================================
                Variables
            ================================== */}

            <div className="min-h-0 flex-1">

                <EnvironmentVariables />

            </div>


            {/* ==================================
                Create Environment Modal
            ================================== */}

            {createModalOpen && (

                <CreateEnvironmentModal
                    onClose={() =>
                        setCreateModalOpen(false)
                    }
                />

            )}

        </div>
    );
}