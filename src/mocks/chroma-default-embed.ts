// Mock for @chroma-core/default-embed to prevent build errors in browser
export class DefaultEmbeddingFunction {
    generate(texts: string[]) {
        console.warn('DefaultEmbeddingFunction is mocked and should not be used.');
        return Promise.resolve(texts.map(() => []));
    }
}
