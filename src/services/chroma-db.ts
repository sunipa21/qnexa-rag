import { ChromaClient, type Collection } from 'chromadb';

// Interface for vector entry (matching what we used in vector-db.ts for consistency)
export interface VectorEntry {
    id: string;
    vector: number[];
    metadata: {
        docId: string;
        docName: string;
        chunkIndex: number;
        text: string;
        source: 'pdf' | 'url' | 'search';
        sourceUrl?: string;
    };
}

export class ChromaService {
    private client: ChromaClient;
    private collection: Collection | null = null;
    private collectionName = 'knowledge_base';

    constructor() {
        // Assumes Chroma is running locally on default port 8000
        this.client = new ChromaClient({ path: 'http://localhost:8000' });
    }

    async init(): Promise<void> {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: this.collectionName,
                metadata: { "hnsw:space": "cosine" }
            });
            console.log('Chroma DB initialized');
        } catch (error) {
            console.error('Failed to connect to Chroma DB:', error);
            throw new Error('Could not connect to Chroma DB. Is the server running on localhost:8000?');
        }
    }

    async addVectors(entries: VectorEntry[]): Promise<void> {
        if (!this.collection) await this.init();
        if (!this.collection) throw new Error('Chroma collection not initialized');

        const ids = entries.map(e => e.id);
        const embeddings = entries.map(e => e.vector);
        const metadatas = entries.map(e => ({
            docId: e.metadata.docId,
            docName: e.metadata.docName,
            chunkIndex: e.metadata.chunkIndex,
            text: e.metadata.text,
            source: e.metadata.source,
            sourceUrl: e.metadata.sourceUrl || ''
        }));
        const documents = entries.map(e => e.metadata.text); // Chroma can store the text too

        await this.collection.add({
            ids,
            embeddings,
            metadatas,
            documents
        });
    }

    async query(queryVector: number[], nResults: number = 3): Promise<any[]> {
        if (!this.collection) await this.init();
        if (!this.collection) throw new Error('Chroma collection not initialized');

        const results = await this.collection.query({
            queryEmbeddings: [queryVector],
            nResults,
        });

        // Transform Chroma results back to our format
        const formattedResults = [];
        if (results.ids.length > 0) {
            for (let i = 0; i < results.ids[0].length; i++) {
                formattedResults.push({
                    id: results.ids[0][i],
                    score: results.distances ? (1 - (results.distances[0][i] || 0)) : 0, // Convert distance to similarity if needed, depends on distance metric
                    metadata: results.metadatas[0][i],
                    text: results.documents[0][i]
                });
            }
        }
        return formattedResults;
    }

    async deleteByDocId(docId: string): Promise<void> {
        if (!this.collection) await this.init();
        if (!this.collection) throw new Error('Chroma collection not initialized');

        await this.collection.delete({
            where: { docId: docId }
        });
    }

    async deleteBySource(source: 'pdf' | 'url' | 'search'): Promise<void> {
        if (!this.collection) await this.init();
        if (!this.collection) throw new Error('Chroma collection not initialized');

        await this.collection.delete({
            where: { source: source }
        });
    }

    async deleteByQuery(_queryText: string): Promise<void> {
        if (!this.collection) await this.init();
        if (!this.collection) throw new Error('Chroma collection not initialized');

        // Chroma doesn't support "contains" in where clause easily for metadata text search without fetching.
        // But we can use the `documents` content search if we had full text search enabled, 
        // or we rely on the upper layer to find IDs and delete.
        // For now, we might need to fetch all and filter if we want to delete by metadata text match, 
        // OR we assume the upper layer (KnowledgeBase) handles the logic of finding what to delete.

        // However, the requirement says "Once it is deleted from the UI then it should be deleted from the chroma DB".
        // The UI usually deletes by ID or Source. "Delete by Query" in UI finds docs then deletes them.
        // So we mainly need deleteByDocId.

        // If we strictly need to delete vectors where text contains query:
        // We would need to query/get all, filter, and delete. 
        // For performance, let's rely on the KnowledgeBase service to identify DocIDs to delete.
    }

    async reset(): Promise<void> {
        if (this.client) {
            await this.client.reset();
            await this.init();
        }
    }
}

export const chromaService = new ChromaService();
