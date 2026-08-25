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

            className="border rounded-lg p-5 mb-6"

        >

            <h2 className="text-xl font-semibold mb-4">

                Create Workspace

            </h2>

            <input

                type="text"

                placeholder="Workspace Name"

                value={name}

                onChange={(e) =>

                    setName(e.target.value)

                }

                className="border rounded w-full p-2 mb-3"

            />

            <textarea

                placeholder="Description"

                value={description}

                onChange={(e) =>

                    setDescription(e.target.value)

                }

                className="border rounded w-full p-2 mb-4"

            />

            <button

                type="submit"

                disabled={loading}

                className="bg-green-600 text-white px-4 py-2 rounded"

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