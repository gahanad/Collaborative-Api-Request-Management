
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useRequestStore } from "../../store/RequestStore";
import { useCollectionStore } from "@/store/CollectionStore";

import RequestEditorHeader from "./requestEditorHeader";
import RequestEditorTabs from "./requestEditorTabs";
import HeadersEditor from "./headersEditor";
import QueryParamsEditor from "./queryParamsEditor";
import AuthorizationEditor from "./authorizationEditor";
import BodyEditor from "./bodyEditor";
import ResponseViewer from "./responseViewer";
import HistoryPanel from "./historyPanel";

export type RequestEditorTab =
    | "params"
    | "headers"
    | "authorization"
    | "body"
    | "response";

export default function RequestEditor() {
    const { selectedRequest, hasUnsavedChanges } =
        useRequestStore();

    const { workspaceId } = useParams();
    const { selectedCollection } = useCollectionStore();

    const [activeTab, setActiveTab] =
        useState<RequestEditorTab>("params");

    useEffect(() => {
        setActiveTab("params");
    }, [selectedRequest?.id]);

    if (!selectedRequest) {
        return (
            <main className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-white">
                <div className="px-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-3xl text-violet-600">
                        ⇆
                    </div>

                    <h2 className="text-lg font-semibold tracking-tight text-[#35105f]">
                        Select a request
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#877994]">
                        Choose a request from your collections to configure,
                        execute, and inspect its response.
                    </p>
                </div>
            </main>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "headers":
                return <HeadersEditor />;

            case "params":
                return <QueryParamsEditor />;

            case "authorization":
                return <AuthorizationEditor />;

            case "body":
                return <BodyEditor />;

            case "response":
                return <ResponseViewer />;

            default:
                return null;
        }
    };

    return (
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {/* Request title, URL, method and Send button */}
            <div className="shrink-0 border-b border-[#eee7f5]">
                <RequestEditorHeader request={selectedRequest} />
            </div>

            {/* Unsaved changes */}
            {hasUnsavedChanges && (
                <div className="flex shrink-0 items-center gap-2 border-b border-amber-200/80 bg-amber-50/80 px-5 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <p className="text-xs font-medium text-amber-800">
                        Unsaved changes
                    </p>
                </div>
            )}

            {/* Request configuration and response tabs */}
            <div className="shrink-0 border-b border-[#eee7f5] bg-white">
                <RequestEditorTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Show only the selected tab's content */}
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-white">
                {renderTabContent()}
            </section>

            {/* Execution history */}
            {selectedCollection && workspaceId && (
                <section className="flex h-[22%] min-h-[120px] max-h-[220px] shrink-0 flex-col overflow-hidden border-t border-[#e9ddf4] bg-[#fcfbfe]">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <HistoryPanel
                            workspaceId={Number(workspaceId)}
                            collectionId={selectedCollection.id}
                            requestId={selectedRequest.id}
                        />
                    </div>
                </section>
            )}
        </main>
    );
}
