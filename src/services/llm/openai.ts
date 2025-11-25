import type { LLMProvider, LLMMessage, LLMConfig } from '../../types';

export const OpenAIProvider: LLMProvider = {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o',

    async *chat(messages: LLMMessage[], config: LLMConfig) {
        if (!config.apiKey) {
            throw new Error('OpenAI API Key is required');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
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
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const json = JSON.parse(data);
                    const content = json.choices[0]?.delta?.content;
                    if (content) {
                        yield content;
                    }
                } catch (e) {
                    console.error('Error parsing OpenAI stream:', e);
                }
            }
        }
    },

    async getModels(config: LLMConfig) {
        if (!config.apiKey) return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch models');

            const data = await response.json();
            return data.data
                .filter((m: any) => m.id.startsWith('gpt'))
                .map((m: any) => m.id)
                .sort();
        } catch (e) {
            console.error('Error fetching OpenAI models:', e);
            return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        }
    }
};
