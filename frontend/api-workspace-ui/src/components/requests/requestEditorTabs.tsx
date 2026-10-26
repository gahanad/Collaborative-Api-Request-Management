
import type { RequestEditorTab } from "./requestEditor";

interface RequestEditorTabsProps {
    activeTab: RequestEditorTab;
    onTabChange: (tab: RequestEditorTab) => void;
}

export default function RequestEditorTabs({
    activeTab,
    onTabChange,
}: RequestEditorTabsProps) {
    const tabs: {
        id: RequestEditorTab;
        label: string;
    }[] = [
        { id: "params", label: "Params" },
        { id: "headers", label: "Headers" },
        { id: "authorization", label: "Authorization" },
        { id: "body", label: "Body" },
        { id: "response", label: "Response" },
    ];

    return (
        <div className="shrink-0 overflow-x-auto border-b border-[#eee7f5] bg-white">
            <div className="flex min-w-max">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            shrink-0 whitespace-nowrap border-b-2
                            px-6 py-3 text-sm font-medium transition-colors
                            ${
                                activeTab === tab.id
                                    ? "border-violet-600 text-violet-700"
                                    : "border-transparent text-gray-500 hover:bg-violet-50/50 hover:text-violet-700"
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
