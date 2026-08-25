import { create } from "zustand";

import type {
    CollectionSummary,
    CreateCollectionRequest,
    UpdateCollectionRequest,
} from "../types/collection";

import { collectionService } from "../services/collectionService";

interface CollectionStore {
    collections: CollectionSummary[];
    selectedCollection: CollectionSummary | null;
    loading: boolean;
    error: string | null;
    fetchCollections: (workspaceId: number) => Promise<void>;
    createCollection: (
        workspaceId: number,
        request: CreateCollectionRequest
    ) => Promise<void>;

    deleteCollection: (
        workspaceId: number,
        collectionId: number
    ) => Promise<void>;

    selectCollection: (
        collection: CollectionSummary | null
    ) => void;

    clearCollections: () => void;

    updateCollection: (
        workspaceId: number,
        collectionId: number,
        request: UpdateCollectionRequest
    ) => Promise<void>;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
    collections: [],
    selectedCollection: null,
    loading: false,
    error: null,
    fetchCollections: async (workspaceId) => {
        set({
            loading: true,
            error: null,
        });

        try {
            const collections =
                await collectionService.getAllCollections(workspaceId);
            set({
                collections,
                loading: false,
            });
        } catch (error) {
            console.error(error);
            set({
                loading: false,
                error: "Failed to load collections.",
            });
        }
    },

    createCollection: async (workspaceId, request) => {
        set({
            loading: true,
            error: null,
        });
        try {
            await collectionService.createCollection(
                workspaceId,
                request
            );
            await get().fetchCollections(workspaceId);
        } catch (error) {
            console.error(error);
            set({
                loading: false,
                error: "Failed to create collection.",
            });
        }
    },

    deleteCollection: async (
        workspaceId,
        collectionId
    ) => {
        set({
            loading: true,
            error: null,
        });
        try {
            await collectionService.deleteCollection(collectionId);
            const selected =
                get().selectedCollection;
            if (
                selected &&
                selected.id === collectionId
            ) {
                set({
                    selectedCollection: null,
                });
            }
            await get().fetchCollections(workspaceId);
        } catch (error) {
            console.error(error);
            set({
                loading: false,
                error: "Failed to delete collection.",
            });
        }
    },
    selectCollection: (collection) => {
        set({
            selectedCollection: collection,
        });
    },
    clearCollections: () => {
        set({
            collections: [],
            selectedCollection: null,
            loading: false,
            error: null,
        });
    },
    
    updateCollection: async (
        workspaceId,
        collectionId,
        request
    ) => {

        set({
            loading: true,
            error: null,
        });

        try {

            await collectionService.updateCollection(
                collectionId,
                request
            );

            await get().fetchCollections(workspaceId);

        } catch (error) {

            console.error(error);

            set({
                loading: false,
                error: "Failed to update collection.",
            });

        }

    },
}));