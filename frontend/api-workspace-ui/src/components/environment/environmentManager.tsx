
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Settings2, Plus } from "lucide-react";

import EnvironmentSelector from "./environmentSelector";
import EnvironmentVariables from "./environmentVariables";
import CreateEnvironmentModal from "./createEnvironmentModal";

export default function EnvironmentManager() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          className="inline-flex items-center gap-2 rounded-xl border border-[#eadcf7] bg-white px-3 py-2 text-sm font-medium text-[#5b3478] shadow-sm transition hover:border-violet-300 hover:bg-[#fcfaff] focus:outline-none focus:ring-4 focus:ring-violet-100"
        >
          <Globe size={16} className="text-violet-600" />
          <span className="max-w-36 truncate">Environment</span>
          <ChevronDown
            size={15}
            className={`text-[#9b85ad] transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[#eee5f7] bg-white p-3 shadow-xl shadow-violet-950/10">
            <div className="mb-3">
              <p className="text-sm font-semibold text-[#35105f]">
                Active environment
              </p>
              <p className="mt-1 text-xs text-[#9b8aaa]">
                Choose an environment or manage its variables.
              </p>
            </div>

            <div className="rounded-xl border border-[#f0e8f8] p-2">
              <EnvironmentSelector />
            </div>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCreateModalOpen(true);
              }}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
            >
              <Plus size={15} />
              Create environment
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setVariablesOpen(true);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#6d547e] transition hover:bg-[#faf7fd]"
            >
              <Settings2 size={15} />
              Manage variables
            </button>
          </div>
        )}
      </div>

      {variablesOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#eee5f7] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee5f7] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#35105f]">
                  Environment variables
                </h2>
                <p className="mt-1 text-xs text-[#9b8aaa]">
                  Configure values used in your requests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setVariablesOpen(false)}
                aria-label="Close environment variables"
                className="rounded-lg px-3 py-1.5 text-sm text-[#765d88] hover:bg-violet-50"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <EnvironmentVariables />
            </div>
          </div>
        </div>
      )}

      {createModalOpen && (
        <CreateEnvironmentModal
          onClose={() => setCreateModalOpen(false)}
        />
      )}
    </>
  );
}
