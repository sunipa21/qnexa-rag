import type { LLMProvider, LLMMessage, LLMConfig } from '../../types';

const DEFAULT_HF_BASE_URL = 'https://api-inference.huggingface.co/models';

export const HuggingFaceProvider: LLMProvider = {
    id: 'huggingface',
    name: 'Hugging Face',
    defaultModel: 'meta-llama/Llama-2-7b-chat-hf',

    async *chat(messages: LLMMessage[], config: LLMConfig) {
        if (!config.apiKey) {
            throw new Error('Hugging Face API Key is required');
        }

        const baseUrl = config.baseUrl || DEFAULT_HF_BASE_URL;
        const url = baseUrl.includes(config.model)
            ? baseUrl
            : `${baseUrl}/${config.model}`;

        // Convert messages to HF format (simple prompt concatenation)
        const prompt = messages
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n') + '\nAssistant:';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 1024,
                    temperature: 0.7,
                    return_full_text: false,
                },
                options: {
                    use_cache: false,
                    wait_for_model: true,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Hugging Face API request failed';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // HF Inference API returns different formats depending on the model
        if (Array.isArray(data)) {
            const text = data[0]?.generated_text || '';
            yield text;
        } else if (data.generated_text) {
            yield data.generated_text;
        } else if (typeof data === 'string') {
            yield data;
        } else {
            console.error('Unexpected HF response format:', data);
            yield JSON.stringify(data);
        }
    },

    async getModels() {
        // Popular HF chat models
        return [
            'meta-llama/Llama-2-7b-chat-hf',
            'meta-llama/Llama-2-13b-chat-hf',
            'meta-llama/Llama-2-70b-chat-hf',
            'mistralai/Mistral-7B-Instruct-v0.2',
            'mistralai/Mixtral-8x7B-Instruct-v0.1',
            'google/flan-t5-xxl',
            'tiiuae/falcon-7b-instruct',
        ];
    }
};
