import type { LLMMessage, LLMConfig, LLMProvider } from '../../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { OllamaProvider } from './ollama';

export const streamCompletion = async function* (
    messages: LLMMessage[],
    config: LLMConfig,
    _useKnowledgeBase: boolean
): AsyncGenerator<string, void, unknown> {
    let provider: LLMProvider;
    switch (config.provider) {
        case 'openai':
            provider = OpenAIProvider;
            break;
        case 'gemini':
            provider = GeminiProvider;
            break;
        case 'ollama':
            provider = OllamaProvider;
            break;
        default:
            throw new Error(`Unknown provider: ${config.provider}`);
    }

    // Note: Knowledge base logic is handled in ChatInterface before calling this,
    // or we could move it here if we want to centralize it.
    // For now, we assume messages already contain the context if needed.

    const stream = await provider.chat(messages, config);
    for await (const chunk of stream) {
        yield chunk;
    }
};
