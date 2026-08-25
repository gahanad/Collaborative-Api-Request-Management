import { useEnvironmentStore } from "../../store/EnvironmentStore";


export default function EnvironmentSelector() {

    const {
        environments,

        selectedEnvironment,

        setSelectedEnvironment,
    } = useEnvironmentStore();


    // ==========================================
    // No environments
    // ==========================================

    if (environments.length === 0) {

        return (

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                <span
                    className="
                        text-sm
                        text-gray-500
                    "
                >
                    No environment
                </span>

            </div>

        );
    }


    return (

        <div
            className="
                flex
                items-center
                gap-2
            "
        >

            <label
                className="
                    text-xs
                    font-medium
                    text-gray-500
                "
            >
                Environment
            </label>


            <select
                value={
                    selectedEnvironment?.id ?? ""
                }

                onChange={(event) => {

                    const environmentId =
                        Number(event.target.value);


                    const environment =
                        environments.find(
                            (env) =>
                                env.id ===
                                environmentId
                        );


                    if (environment) {

                        setSelectedEnvironment(
                            environment
                        );

                    }

                }}

                className="
                    min-w-[180px]
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2
                    text-sm
                    text-gray-700
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-300
                "
            >

                {!selectedEnvironment && (

                    <option value="">
                        Select environment
                    </option>

                )}


                {environments.map(
                    (environment) => (

                        <option
                            key={environment.id}
                            value={environment.id}
                        >
                            {environment.name}
                        </option>

                    )
                )}

            </select>

        </div>
    );
}