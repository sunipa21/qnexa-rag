import type { LLMProvider, LLMMessage, LLMConfig } from '../../types';

export const OllamaProvider: LLMProvider = {
    id: 'ollama',
    name: 'Ollama',
    defaultModel: 'llama3',

    async *chat(messages: LLMMessage[], config: LLMConfig) {
        const baseUrl = config.baseUrl || 'http://localhost:11434';

        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error('Ollama API request failed');
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        yield json.message.content;
                    }
                    if (json.done) return;
                } catch (e) {
                    console.error('Error parsing Ollama stream:', e);
                }
            }
        }
    },

    async getModels(config: LLMConfig) {
        const baseUrl = config.baseUrl || 'http://localhost:11434';
        try {
            const response = await fetch(`${baseUrl}/api/tags`);
            if (!response.ok) throw new Error('Failed to fetch Ollama models');

            const data = await response.json();
            return data.models.map((m: any) => m.name);
        } catch (e) {
            console.error('Error fetching Ollama models:', e);
            return ['llama3', 'mistral', 'gemma'];
        }
    }
};
