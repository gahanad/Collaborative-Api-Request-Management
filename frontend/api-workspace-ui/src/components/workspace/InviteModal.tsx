import { useState } from "react";
import  workspaceService  from "../../services/workspaceService";

interface InviteModalProps {
    workspaceId: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ workspaceId, isOpen, onClose }: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VIEWER");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await workspaceService.inviteUser(workspaceId, { 
                email, 
                role: role as "ADMIN" | "EDITOR" | "VIEWER" 
            });
            alert("Invitation sent successfully!");
            setEmail("");
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to send invitation");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-bold mb-4">Invite Member</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">User Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                        <select
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="VIEWER">Viewer (Read Only)</option>
                            <option value="EDITOR">Editor (Can Create Requests)</option>
                            <option value="ADMIN">Admin (Full Access)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send Invite"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}