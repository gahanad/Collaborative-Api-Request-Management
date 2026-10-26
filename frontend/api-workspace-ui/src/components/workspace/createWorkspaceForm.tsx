import { useState } from "react";

import { useWorkspaceStore } from "../../store/WorkspaceStore";

export default function CreateWorkspaceForm() {

    const createWorkspace =
        useWorkspaceStore(
            (state) => state.createWorkspace
        );

    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (

        e: React.FormEvent

    ) => {

        e.preventDefault();

        if (!name.trim()) {

            alert("Workspace name is required");

            return;

        }

        try {

            setLoading(true);

            await createWorkspace({

                name,

                description

            });

            setName("");

            setDescription("");

        }

        catch (error) {

            console.error(error);

            alert("Unable to create workspace");

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <form

            onSubmit={handleSubmit}

            className="aw-card grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"

        >

            <h2 className="text-sm font-semibold text-[#35105f] sm:col-span-3">

                Create Workspace

            </h2>

            <input

                type="text"

                placeholder="Workspace Name"

                value={name}

                onChange={(e) =>

                    setName(e.target.value)

                }

                className="aw-input"

            />

            <textarea

                placeholder="Description"

                value={description}

                onChange={(e) =>

                    setDescription(e.target.value)

                }

                className="aw-input min-h-10 resize-y"

            />

            <button

                type="submit"

                disabled={loading}

                className="aw-primary inline-flex min-h-10 items-center justify-center px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"

            >

                {

                    loading

                    ?

                    "Creating..."

                    :

                    "Create Workspace"

                }

            </button>

        </form>

    );

}