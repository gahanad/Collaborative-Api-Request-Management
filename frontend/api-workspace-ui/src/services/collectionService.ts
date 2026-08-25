import api from "./api";
import type {
    CollectionSummary,
    CreateCollectionRequest,
    UpdateCollectionRequest,
} from "../types/collection";

const COLLECTION_BASE_URL = "/workspaces/collection";

export const collectionService = {

    async getAllCollections(
        workspaceId: number
    ): Promise<CollectionSummary[]> {

        const response = await api.get<CollectionSummary[]>(
            `${COLLECTION_BASE_URL}/${workspaceId}/getAllcollections`
        );

        return response.data;
    },

    async createCollection(
        workspaceId: number,
        request: CreateCollectionRequest
    ): Promise<void> {

        await api.post(
            `${COLLECTION_BASE_URL}/${workspaceId}/createCollection`,
            request
        );
    },

    async deleteCollection(
        collectionId: number
    ): Promise<void> {

        await api.delete(
            `${COLLECTION_BASE_URL}/${collectionId}`
        );
    },

    async updateCollection(
        collectionId: number,
        request: UpdateCollectionRequest
    ): Promise<void> {
        await api.put(
            `${COLLECTION_BASE_URL}/${collectionId}`,
            request
        );
    }

};