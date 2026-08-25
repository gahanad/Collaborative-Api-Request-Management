import { useRequestStore } from "../../store/RequestStore";

import RequestEditorHeader from "./requestEditorHeader";
import RequestEditorTabs from "./requestEditorTabs";
import HeadersEditor from "./headersEditor";
import { useEffect, useState } from "react";
import QueryParamsEditor from "./queryParamsEditor";
import AuthorizationEditor from "./authorizationEditor";
import BodyEditor from "./bodyEditor";
import ResponseViewer from "./responseViewer";
import HistoryPanel from "./historyPanel";
import { useParams } from "react-router-dom";
import { useCollectionStore } from "@/store/CollectionStore";

export type RequestEditorTab =
    | "params"
    | "headers"
    | "authorization"
    | "body";


export default function RequestEditor(
) {
    const {
        selectedRequest,
        hasUnsavedChanges,
    } = useRequestStore();

    const { workspaceId } = useParams();

    const {
        selectedCollection,
    } = useCollectionStore();
    const [
        activeTab,
        setActiveTab,
    ] = useState<RequestEditorTab>("params");
    
    useEffect(() => {

        setActiveTab("params");

    }, [selectedRequest?.id]);



    // ==================================
    // No Request Selected
    // ==================================

    if (!selectedRequest) {

        return (

            <main className="flex h-full `min-w-[700px]` items-center justify-center bg-gray-50">

                <div className="text-center">

                    <div className="mb-3 text-4xl">
                        ⇆
                    </div>

                    <h2 className="text-lg font-semibold text-gray-700">
                        Select a request
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Select a request from the sidebar
                        to open the request editor.
                    </p>

                </div>

            </main>

        );
    }


    // ==================================
    // Render Active Tab
    // ==================================

    const renderTabContent = () => {

        switch (activeTab) {

            case "headers":

                return (
                    <HeadersEditor />
                );


            case "params":
                return (
                    <QueryParamsEditor />
                );


            case "authorization":
                return (
                    <AuthorizationEditor />
                );


            case "body":

                return (
                    <BodyEditor/>
                );


            default:

                return null;
        }
    };


    return (

        <main className="flex h-full `min-w-[700px]` flex-col bg-gray-50">

            {/* ==================================
                Request Header
            ================================== */}

            <RequestEditorHeader
                request={selectedRequest}
            />


            {/* ==================================
                Unsaved Changes
            ================================== */}

            {hasUnsavedChanges && (

                <div className="shrink-0 border-b bg-yellow-50 px-5 py-2">

                    <p className="text-xs font-medium text-yellow-700">
                        ● Unsaved changes
                    </p>

                </div>

            )}


            {/* ==================================
                Tabs
            ================================== */}

            <RequestEditorTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />


            {/* ==================================
                Tab Content
            ================================== */}

            <div className="flex min-h-0 flex-1 flex-col">

                {/* Request configuration */}

                <div className="min-h-0 flex-1 overflow-y-auto">

                    {renderTabContent()}

                </div>


                <div
                    className="
                        flex
                        h-[40%]
                        min-h-[300px]
                        shrink-0
                        flex-col
                    "
                >

                    {/* Response */}

                    <div className="min-h-0 flex-1">

                        <ResponseViewer />

                    </div>


                    {/* History */}

                    {selectedRequest &&
                    selectedCollection &&
                    workspaceId && (

                    <div
                        className="
                            h-[40%]
                            min-h-[300px]
                            shrink-0
                            flex
                            flex-col
                        "
                    >

                        <HistoryPanel
                            workspaceId={Number(workspaceId)}
                            collectionId={
                                selectedCollection.id
                            }
                            requestId={
                                selectedRequest.id
                            }
                        />

                    </div>

                )}


                </div>

            </div>

            
        </main>
    );
}