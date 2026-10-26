
import { ChevronDown, Globe2 } from "lucide-react";
import { useEnvironmentStore } from "../../store/EnvironmentStore";

export default function EnvironmentSelector() {
    const {
        environments,
        selectedEnvironment,
        setSelectedEnvironment,
    } = useEnvironmentStore();

    if (environments.length === 0) {
        return (
            <div className="flex h-10 max-w-full items-center gap-2 rounded-lg border border-[#eee5f5] bg-[#faf8fd] px-3">
                <Globe2 size={14} className="shrink-0 text-[#9b8aaa]" />
                <span className="whitespace-nowrap text-xs text-[#877994]">
                    No environment
                </span>
            </div>
        );
    }

    return (
        <div className="flex h-10 min-w-0 max-w-full items-center gap-2 rounded-lg border border-[#e5d9ef] bg-white px-2.5 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
            <Globe2 size={14} className="shrink-0 text-violet-600" />

            <select
                value={selectedEnvironment?.id ?? ""}
                onChange={(event) => {
                    const environmentId = Number(event.target.value);

                    const environment = environments.find(
                        (env) => env.id === environmentId
                    );

                    if (environment) {
                        setSelectedEnvironment(environment);
                    }
                }}
                aria-label="Environment"
                className="min-w-0 w-[120px] max-w-full cursor-pointer truncate border-0 bg-transparent py-1 text-xs font-medium text-[#51336b] outline-none focus:ring-0 sm:w-[145px]"
            >
                {!selectedEnvironment && (
                    <option value="">Select environment</option>
                )}

                {environments.map((environment) => (
                    <option key={environment.id} value={environment.id}>
                        {environment.name}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={13}
                className="pointer-events-none shrink-0 text-[#9b8aaa]"
            />
        </div>
    );
}
