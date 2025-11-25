export type LLMMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export type LLMConfig = {
    provider: 'openai' | 'gemini' | 'ollama';
    apiKey?: string;
    model: string;
    baseUrl?: string;
};

export type LLMProvider = {
    id: string;
    name: string;
    defaultModel: string;
    chat: (messages: LLMMessage[], config: LLMConfig) => AsyncGenerator<string, void, unknown>;
    getModels: (config: LLMConfig) => Promise<string[]>;
};
