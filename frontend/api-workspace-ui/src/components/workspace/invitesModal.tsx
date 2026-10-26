
import { useState, type FormEvent } from "react";
import { Mail, ShieldCheck, UserPlus, X } from "lucide-react";
import workspaceService from "../../services/workspaceService";

interface InviteModalProps {
    workspaceId: number;
    isOpen: boolean;
    onClose: () => void;
}

type MemberRole = "ADMIN" | "EDITOR" | "VIEWER";

export default function InviteModal({
    workspaceId,
    isOpen,
    onClose,
}: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<MemberRole>("VIEWER");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await workspaceService.inviteUser(workspaceId, {
                email,
                role,
            });

            window.alert("Invitation sent successfully!");
            setEmail("");
            setRole("VIEWER");
            onClose();
        } catch (error: unknown) {
            const message =
                typeof error === "object" &&
                error !== null &&
                "response" in error
                    ? (
                          error as {
                              response?: {
                                  data?: { message?: string };
                              };
                          }
                      ).response?.data?.message
                    : undefined;

            window.alert(message || "Failed to send invitation");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#080511]/65 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !isSubmitting
                ) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="invite-modal-title"
                className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-violet-400/25 bg-[#191123]/90 p-6 text-[#F5F0FF] shadow-2xl shadow-purple-950/50 backdrop-blur-2xl sm:p-7"
            >
                {/* Subtle neon glow */}
                <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />

                <div className="relative mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/15 text-violet-300">
                            <UserPlus size={21} />
                        </div>

                        <div>
                            <h2
                                id="invite-modal-title"
                                className="text-xl font-semibold tracking-tight text-white"
                            >
                                Invite a member
                            </h2>

                            <p className="mt-1 text-sm text-[#B9A9CB]">
                                Collaborate on your API workspace.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close invite dialog"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-[#B9A9CB] transition hover:border-[#49365E] hover:bg-[#2D2040] hover:text-white disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="relative space-y-5">
                    <div>
                        <label
                            htmlFor="invite-email"
                            className="mb-2 flex items-center gap-2 text-sm font-medium text-[#E5D8F5]"
                        >
                            <Mail size={15} className="text-violet-300" />
                            User email
                        </label>

                        <input
                            id="invite-email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={isSubmitting}
                            className="h-11 w-full rounded-xl border border-[#49365E] bg-[#100B1B]/80 px-3.5 text-sm text-white outline-none transition placeholder:text-[#786889] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="invite-role"
                            className="mb-2 flex items-center gap-2 text-sm font-medium text-[#E5D8F5]"
                        >
                            <ShieldCheck
                                size={15}
                                className="text-violet-300"
                            />
                            Workspace role
                        </label>

                        <select
                            id="invite-role"
                            value={role}
                            onChange={(event) =>
                                setRole(event.target.value as MemberRole)
                            }
                            disabled={isSubmitting}
                            className="h-11 w-full rounded-xl border border-[#49365E] bg-[#100B1B] px-3.5 text-sm text-[#F5F0FF] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                        >
                            <option value="VIEWER">
                                Viewer — Read only
                            </option>
                            <option value="EDITOR">
                                Editor — Create requests
                            </option>
                            <option value="ADMIN">
                                Admin — Full access
                            </option>
                        </select>

                        <p className="mt-2 text-xs leading-5 text-[#A99ABD]">
                            Choose the permissions this member should have.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#3B2B4D] pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border border-[#49365E] bg-[#241831]/70 px-4 py-2.5 text-sm font-medium text-[#D4C5E5] transition hover:bg-[#30203F] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-400 focus:outline-none focus:ring-4 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <UserPlus size={16} />
                            {isSubmitting ? "Sending..." : "Send invite"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
