import { cosineSimilarity } from './embeddings';

// Vector entry stored in IndexedDB
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

// Search result
export interface VectorSearchResult {
    id: string;
    score: number;
    metadata: VectorEntry['metadata'];
}

/**
 * Vector Database using IndexedDB for storage
 * Provides semantic search using cosine similarity
 */
export class VectorDB {
    private dbName = 'knowledge_base_vectors';
    private storeName = 'vectors';
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('docId', 'metadata.docId', { unique: false });
                    objectStore.createIndex('source', 'metadata.source', { unique: false });
                }
            };
        });
    }

    /**
     * Add a vector to the database
     */
    async addVector(entry: VectorEntry): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(entry);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    /**
     * Add multiple vectors in batch
     */
    async addVectorsBatch(entries: VectorEntry[]): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            let completed = 0;
            for (const entry of entries) {
                const request = store.put(entry);
                request.onsuccess = () => {
                    completed++;
                    if (completed === entries.length) resolve();
                };
                request.onerror = () => reject(request.error);
            }
        });
    }

    /**
     * Search for similar vectors using cosine similarity
     */
    async search(queryVector: number[], topK: number = 3): Promise<VectorSearchResult[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const entries: VectorEntry[] = request.result;

                // Calculate similarity scores
                const results = entries.map(entry => ({
                    id: entry.id,
                    score: cosineSimilarity(queryVector, entry.vector),
                    metadata: entry.metadata,
                }));

                // Sort by score and return top K
                results.sort((a, b) => b.score - a.score);
                resolve(results.slice(0, topK));
            };
        });
    }

    /**
     * Delete vector by ID
     */
    async deleteById(id: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    /**
     * Delete all vectors for a document
     */
    async deleteByDocId(docId: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('docId');
            const request = index.openCursor(IDBKeyRange.only(docId));

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        });
    }

    /**
     * Delete all vectors by source type
     */
    async deleteBySource(source: 'pdf' | 'url' | 'search'): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('source');
            const request = index.openCursor(IDBKeyRange.only(source));

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        });
    }

    /**
     * Delete vectors matching a text query
     */
    async deleteByQuery(queryText: string): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const entries: VectorEntry[] = request.result;
                const queryLower = queryText.toLowerCase();
                let deleted = 0;

                // Find entries matching the query
                const toDelete = entries.filter(entry =>
                    entry.metadata.text.toLowerCase().includes(queryLower) ||
                    entry.metadata.docName.toLowerCase().includes(queryLower)
                );

                // Delete matching entries
                const deleteTransaction = this.db!.transaction([this.storeName], 'readwrite');
                const deleteStore = deleteTransaction.objectStore(this.storeName);

                for (const entry of toDelete) {
                    deleteStore.delete(entry.id);
                    deleted++;
                }

                deleteTransaction.oncomplete = () => resolve(deleted);
                deleteTransaction.onerror = () => reject(deleteTransaction.error);
            };
        });
    }

    /**
     * Clear all vectors
     */
    async clear(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    /**
     * Get total count of vectors
     */
    async count(): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.count();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

// Singleton instance
export const vectorDB = new VectorDB();
