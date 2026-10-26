
import { Bell, UserRound } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#3B2B4D] bg-[#191123]/95 px-5 text-[#F5F0FF] shadow-sm shadow-purple-950/20 backdrop-blur-xl sm:px-8">
            {/* Mobile brand */}
            <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-600 to-purple-500 text-sm font-bold text-white shadow-md shadow-violet-950/30">
                    {"{ }"}
                </div>

                <span className="font-semibold tracking-tight text-[#F5F0FF]">
                    API Workspace
                </span>
            </div>

            {/* Breadcrumb */}
            <div className="hidden flex-1 items-center pl-6 sm:flex">
                <span className="text-sm font-semibold text-violet-300">
                    Dashboard
                </span>

                <span className="mx-3 text-[#665275]">/</span>

                <span className="text-sm text-[#B9A9CB]">
                    Your API workspaces at a glance
                </span>
            </div>

            {/* Account actions */}
            <div className="ml-auto flex items-center gap-3">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#49365E] bg-[#241831] text-[#C4A5FF] transition hover:border-violet-400/60 hover:bg-[#30203F] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                    <Bell size={17} />

                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fuchsia-400 ring-2 ring-[#241831]" />
                </button>

                <div className="hidden h-8 w-px bg-[#49365E] sm:block" />

                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-300/20 bg-[#30203F] text-violet-300">
                        <UserRound size={18} />
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-[#F5F0FF]">
                            Your account
                        </p>

                        <p className="text-xs text-[#B9A9CB]">
                            Developer
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
