import { useEffect } from "react";
import { useWorkspaceStore } from "../../store/WorkspaceStore";

export default function InvitationsList() {
    const { invitations, fetchInvitations, acceptInvitation, rejectInvitation } = useWorkspaceStore();

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    if (!invitations || invitations.length === 0) return null;

    return (
        <div className="mt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Invitations</h2>
            <div className="space-y-3">
                {invitations.map((invite) => (
                    <div key={invite.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-yellow-800">{invite.workspaceName}</h3>
                            <p className="text-sm text-yellow-700">
                                Invited by {invite.invitedByName} as <strong>{invite.role}</strong>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => rejectInvitation(invite.id)}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => acceptInvitation(invite.id)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}