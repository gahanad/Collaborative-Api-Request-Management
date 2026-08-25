import type { RequestEditorTab } from "./requestEditor";

interface RequestEditorTabsProps {
    activeTab: RequestEditorTab;

    onTabChange: (
        tab: RequestEditorTab
    ) => void;
}


export default function RequestEditorTabs({
    activeTab,
    onTabChange,
}: RequestEditorTabsProps) {


    const tabs: {
        id: RequestEditorTab;
        label: string;
    }[] = [

        {
            id: "params",
            label: "Params",
        },

        {
            id: "headers",
            label: "Headers",
        },

        {
            id: "authorization",
            label: "Authorization",
        },

        {
            id: "body",
            label: "Body",
        },

    ];


    return (

        <div className="shrink-0 overflow-x-auto border-b bg-white">

            <div className="flex min-w-max">

                {tabs.map((tab) => (

                    <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                            onTabChange(tab.id)
                        }
                        className={`
                            shrink-0
                            whitespace-nowrap
                            border-b-2
                            px-6
                            py-3
                            text-sm
                            font-medium
                            transition
                            ${
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-800"
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