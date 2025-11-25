import type { LLMProvider, LLMMessage, LLMConfig } from '../../types';

export const GeminiProvider: LLMProvider = {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',

    async *chat(messages: LLMMessage[], config: LLMConfig) {
        if (!config.apiKey) {
            throw new Error('Gemini API Key is required');
        }

        // Convert messages to Gemini format
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:streamGenerateContent?key=${config.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API request failed');
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process buffer to extract complete JSON objects
            // Gemini stream returns JSON array format: [{ ... }, { ... }]

            let braceCount = 0;
            let inString = false;
            let escape = false;
            let objectStart = -1;

            for (let i = 0; i < buffer.length; i++) {
                const char = buffer[i];

                if (escape) {
                    escape = false;
                    continue;
                }

                if (char === '\\') {
                    escape = true;
                    continue;
                }

                if (char === '"') {
                    inString = !inString;
                    continue;
                }

                if (inString) continue;

                if (char === '{') {
                    if (braceCount === 0) objectStart = i;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0 && objectStart !== -1) {
                        // Found a complete object
                        const jsonStr = buffer.substring(objectStart, i + 1);
                        try {
                            const json = JSON.parse(jsonStr);
                            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) yield text;
                        } catch (e) {
                            console.error('Error parsing Gemini JSON chunk', e);
                        }
                        // Remove processed part from buffer
                        buffer = buffer.substring(i + 1);
                        i = -1; // Reset index since we modified buffer
                        objectStart = -1;
                    }
                }
            }
        }
    },

    async getModels(_config: LLMConfig) {
        // Gemini models are static for now
        return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    }
};
