import { pipeline, env } from '@xenova/transformers';

// Disable local model loading, use CDN
env.allowLocalModels = false;

// Embedding provider type
export type EmbeddingProvider = 'transformers' | 'openai' | 'gemini';

// Singleton embedding model
let embeddingModel: any = null;

/**
 * Generate embeddings using Transformers.js (client-side)
 * Uses all-MiniLM-L6-v2 model (~23MB, good balance of speed and quality)
 */
async function generateEmbeddingTransformers(text: string): Promise<number[]> {
    if (!embeddingModel) {
        console.log('Loading embedding model (one-time, ~23MB download)...');
        embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    const output = await embeddingModel(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

/**
 * Generate embeddings using OpenAI API
 */
async function generateEmbeddingOpenAI(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text,
        }),
    });

    if (!response.ok) {
        throw new Error('OpenAI embedding API failed');
    }

    const data = await response.json();
    return data.data[0].embedding;
}

/**
 * Generate embeddings using Gemini API
 */
async function generateEmbeddingGemini(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: {
                    parts: [{ text }],
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error('Gemini embedding API failed');
    }

    const data = await response.json();
    return data.embedding.values;
}

/**
 * Main embedding generation function
 * Supports multiple providers with fallback to client-side
 */
export async function generateEmbedding(
    text: string,
    provider: EmbeddingProvider = 'transformers',
    apiKey?: string
): Promise<number[]> {
    try {
        switch (provider) {
            case 'openai':
                if (!apiKey) throw new Error('OpenAI API key required');
                return await generateEmbeddingOpenAI(text, apiKey);

            case 'gemini':
                if (!apiKey) throw new Error('Gemini API key required');
                return await generateEmbeddingGemini(text, apiKey);

            case 'transformers':
            default:
                return await generateEmbeddingTransformers(text);
        }
    } catch (error) {
        console.error('Embedding generation failed:', error);
        // Fallback to client-side if API fails
        if (provider !== 'transformers') {
            console.log('Falling back to client-side embeddings...');
            return await generateEmbeddingTransformers(text);
        }
        throw error;
    }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
