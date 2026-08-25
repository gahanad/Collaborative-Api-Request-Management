interface EnvironmentVariablePreviewProps {
    originalValue: string;
    resolvedValue: string;
    unresolvedVariables?: string[];
}


export default function EnvironmentVariablePreview({
    originalValue,
    resolvedValue,
    unresolvedVariables = [],
}: EnvironmentVariablePreviewProps) {

    if (!originalValue) {
        return null;
    }


    return (

        <div className="mt-2">

            <div className="
                flex
                items-center
                justify-between
            ">

                <span className="
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-wide
                    text-gray-400
                ">
                    Resolved preview
                </span>

            </div>


            <div className="
                mt-1
                rounded-md
                border
                border-gray-200
                bg-gray-50
                px-3
                py-2
            ">

                <p className="
                    break-all
                    font-mono
                    text-xs
                    text-gray-600
                ">
                    {resolvedValue}
                </p>

            </div>


            {unresolvedVariables.length > 0 && (

                <div className="
                    mt-2
                    rounded-md
                    bg-yellow-50
                    px-3
                    py-2
                    text-xs
                    text-yellow-700
                ">

                    Missing variables:

                    {" "}

                    {unresolvedVariables
                        .map(
                            (variable) =>
                                `{{${variable}}}`
                        )
                        .join(", ")}

                </div>

            )}

        </div>
    );
}