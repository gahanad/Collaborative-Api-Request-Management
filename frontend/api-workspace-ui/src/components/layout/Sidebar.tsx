export default function Sidebar() {

    return (
        <aside className="w-64 border-r bg-gray-50 h-full">
            <div className="p-4">
                <h2 className="font-semibold mb-4">
                    Navigation
                </h2>
                <div className="space-y-2">
                    <button
                        className="w-full text-left p-2 rounded hover:bg-gray-200">
                        Dashboard
                    </button>
                    <button
                        className="w-full text-left p-2 rounded hover:bg-gray-200">
                        Workspaces
                    </button>
                    <button
                        className="w-full text-left p-2 rounded hover:bg-gray-200">
                        History
                    </button>
                    <button
                        className="w-full text-left p-2 rounded hover:bg-gray-200">
                        Environment Variables
                    </button>
                    <button
                        className="w-full text-left p-2 rounded hover:bg-gray-200">
                        Activity Logs
                    </button>
                </div>
            </div>
        </aside>
    );

}