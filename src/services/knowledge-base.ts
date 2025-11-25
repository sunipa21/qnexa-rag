import { generateEmbedding, type EmbeddingProvider } from './embeddings';
import { chromaService, type VectorEntry } from './chroma-db';
import { vectorDB } from './vector-db';

export interface Document {
    id: string;
    name: string;
    content: string;
    chunks: string[];
    uploadedAt: number;
    source: 'pdf' | 'url' | 'search';
    sourceUrl?: string;
    hasEmbeddings?: boolean; // Track if embeddings have been generated
}

const STORAGE_KEY = 'knowledge_base_documents';
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

// Chunk text into overlapping segments
function chunkText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + CHUNK_SIZE, text.length);
        const chunk = text.slice(start, end).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    return chunks;
}

export class KnowledgeBase {
    private documents: Document[] = [];
    private embeddingProvider: EmbeddingProvider = 'transformers';
    private apiKey?: string;
    private useChroma: boolean = false; // Track if Chroma is available

    constructor() {
        this.loadFromStorage();
        this.initVectorDB();
    }

    private async initVectorDB(): Promise<void> {
        try {
            await chromaService.init();
            this.useChroma = true;
            console.log('Using Chroma DB for vector storage');
        } catch (error) {
            console.warn('Chroma DB not available, falling back to IndexedDB:', error);
            this.useChroma = false;
            await vectorDB.init();
            console.log('Using IndexedDB for vector storage');
        }
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.documents = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            this.documents = [];
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
        } catch (error) {
            console.error('Error saving knowledge base:', error);
            throw new Error('Failed to save document. Storage may be full.');
        }
    }

    /**
     * Set embedding provider and API key
     */
    setEmbeddingConfig(provider: EmbeddingProvider, apiKey?: string): void {
        this.embeddingProvider = provider;
        this.apiKey = apiKey;
    }

    /**
     * Add document and generate embeddings
     */
    async addDocument(
        name: string,
        content: string,
        source: 'pdf' | 'url' | 'search' = 'pdf',
        sourceUrl?: string,
        onProgress?: (current: number, total: number) => void
    ): Promise<Document> {
        const doc: Document = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name,
            content,
            chunks: chunkText(content),
            uploadedAt: Date.now(),
            source,
            sourceUrl,
            hasEmbeddings: false,
        };

        this.documents.push(doc);
        this.saveToStorage();

        // Generate embeddings and wait for completion
        try {
            await this.generateEmbeddingsForDocument(doc, onProgress);
        } catch (err) {
            console.error('Failed to generate embeddings:', err);
        }

        return doc;
    }

    /**
     * Generate embeddings for a document
     */
    private async generateEmbeddingsForDocument(
        doc: Document,
        onProgress?: (current: number, total: number) => void
    ): Promise<void> {
        const vectorEntries: VectorEntry[] = [];

        for (let i = 0; i < doc.chunks.length; i++) {
            const chunk = doc.chunks[i];

            try {
                const embedding = await generateEmbedding(
                    chunk,
                    this.embeddingProvider,
                    this.apiKey
                );

                vectorEntries.push({
                    id: `${doc.id}_chunk_${i}`,
                    vector: embedding,
                    metadata: {
                        docId: doc.id,
                        docName: doc.name,
                        chunkIndex: i,
                        text: chunk,
                        source: doc.source,
                        sourceUrl: doc.sourceUrl,
                    },
                });

                if (onProgress) {
                    onProgress(i + 1, doc.chunks.length);
                }
            } catch (error) {
                console.error(`Failed to generate embedding for chunk ${i}:`, error);
            }
        }

        // Store vectors in batch (Chroma or IndexedDB)
        if (this.useChroma) {
            await chromaService.addVectors(vectorEntries);
        } else {
            await vectorDB.addVectorsBatch(vectorEntries);
        }

        // Update document to mark embeddings as generated
        doc.hasEmbeddings = true;
        this.saveToStorage();
    }

    /**
     * Search documents using vector similarity
     */
    async searchDocuments(query: string, topK: number = 3): Promise<string[]> {
        try {
            // Generate embedding for query
            const queryEmbedding = await generateEmbedding(
                query,
                this.embeddingProvider,
                this.apiKey
            );

            // Search vector DB (Chroma or IndexedDB)
            let results;
            if (this.useChroma) {
                results = await chromaService.query(queryEmbedding, topK);
            } else {
                results = await vectorDB.search(queryEmbedding, topK);
            }

            // Format results with citations
            return results.map(r => {
                let citation = `Source: ${r.metadata.docName}`;

                if (r.metadata.sourceUrl) {
                    citation += ` (${r.metadata.sourceUrl})`;
                }

                const sourceType = r.metadata.source === 'pdf' ? 'PDF' :
                    r.metadata.source === 'url' ? 'Web Page' :
                        'Web Search Result';
                citation += ` [${sourceType}]`;
                // Chroma distance is 0 for identical, 1 for opposite (usually).
                // If using cosine distance: similarity = 1 - distance.
                // If using inner product (default for some), it's similarity.
                // Assuming cosine distance for now based on init metadata.
                const relevance = r.score !== undefined ? (r.score * 100).toFixed(1) : 'N/A';
                citation += `\nRelevance: ${relevance}%`;
                citation += `\n\n"${r.text || r.metadata.text}"`;

                return citation;
            });
        } catch (error) {
            console.error('Vector search failed:', error);
            return [];
        }
    }

    /**
     * Delete document and its vectors
     */
    async deleteDocument(id: string): Promise<void> {
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.saveToStorage();

        // Delete vectors from vector DB
        if (this.useChroma) {
            await chromaService.deleteByDocId(id);
        } else {
            await vectorDB.deleteByDocId(id);
        }
    }

    /**
     * Delete documents by source type
     */
    async deleteBySource(source: 'pdf' | 'url' | 'search'): Promise<number> {
        const toDelete = this.documents.filter(doc => doc.source === source);
        this.documents = this.documents.filter(doc => doc.source !== source);
        this.saveToStorage();

        // Delete vectors
        if (this.useChroma) {
            await chromaService.deleteBySource(source);
        } else {
            await vectorDB.deleteBySource(source);
        }

        return toDelete.length;
    }

    /**
     * Delete documents matching a query
     */
    async deleteByQuery(queryText: string): Promise<number> {
        const queryLower = queryText.toLowerCase();
        const toDelete = this.documents.filter(doc =>
            doc.name.toLowerCase().includes(queryLower) ||
            doc.content.toLowerCase().includes(queryLower)
        );

        this.documents = this.documents.filter(doc =>
            !doc.name.toLowerCase().includes(queryLower) &&
            !doc.content.toLowerCase().includes(queryLower)
        );
        this.saveToStorage();

        // Delete vectors for each deleted document
        for (const doc of toDelete) {
            if (this.useChroma) {
                await chromaService.deleteByDocId(doc.id);
            } else {
                await vectorDB.deleteByDocId(doc.id);
            }
        }

        return toDelete.length;
    }

    getAllDocuments(): Document[] {
        return this.documents;
    }

    getTotalSize(): number {
        return this.documents.reduce((sum, doc) => sum + doc.content.length, 0);
    }

    async clear(): Promise<void> {
        this.documents = [];
        this.saveToStorage();

        if (this.useChroma) {
            await chromaService.reset();
        } else {
            await vectorDB.clear();
        }
    }

    /**
     * Get vector DB statistics
     * Note: Chroma client doesn't have a simple count() method exposed easily in JS client
     * without fetching all or using admin API.
     * We'll return 0 or implement a count if needed, but for now let's simplify.
     */
    async getVectorStats(): Promise<{ count: number; documentsWithEmbeddings: number }> {
        const documentsWithEmbeddings = this.documents.filter(d => d.hasEmbeddings).length;

        let count = 0;
        if (this.useChroma) {
            count = 0; // Chroma doesn't expose count easily
        } else {
            count = await vectorDB.count();
        }

        return { count, documentsWithEmbeddings };
    }

    /**
     * Migrate existing documents to generate embeddings
     */
    async migrateExistingDocuments(onProgress?: (current: number, total: number) => void): Promise<void> {
        const docsWithoutEmbeddings = this.documents.filter(d => !d.hasEmbeddings);

        for (let i = 0; i < docsWithoutEmbeddings.length; i++) {
            await this.generateEmbeddingsForDocument(docsWithoutEmbeddings[i]);
            if (onProgress) {
                onProgress(i + 1, docsWithoutEmbeddings.length);
            }
        }
    }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
