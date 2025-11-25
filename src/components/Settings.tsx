import React, { useEffect, useState } from 'react';
import type { LLMConfig } from '../types';
import { OpenAIProvider } from '../services/llm/openai';

import { OllamaProvider } from '../services/llm/ollama';

interface SettingsProps {
    config: LLMConfig;
    onConfigChange: (config: LLMConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onConfigChange }) => {
    const [models, setModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    useEffect(() => {
        loadModels();
    }, [config.provider, config.apiKey, config.baseUrl]);

    const loadModels = async () => {
        setLoadingModels(true);
        try {
            let fetchedModels: string[] = [];
            if (config.provider === 'openai') {
                fetchedModels = await OpenAIProvider.getModels(config);
            } else if (config.provider === 'gemini') {
                // Gemini models are static for now or fetched if key exists
                fetchedModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
            } else if (config.provider === 'ollama') {
                fetchedModels = await OllamaProvider.getModels(config);
            }
            setModels(fetchedModels);

            // If current model is not in list, select first one
            if (!fetchedModels.includes(config.model) && fetchedModels.length > 0) {
                onConfigChange({ ...config, model: fetchedModels[0] });
            }
        } catch (e) {
            console.error('Failed to load models', e);
        } finally {
            setLoadingModels(false);
        }
    };

    return (
        <div className="settings-panel">
            <h2>Settings</h2>

            <div className="form-group">
                <label>Provider</label>
                <select
                    value={config.provider}
                    onChange={(e) => onConfigChange({ ...config, provider: e.target.value as any })}
                >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="ollama">Ollama (Local)</option>
                </select>
            </div>

            {config.provider === 'openai' && (
                <div className="form-group">
                    <label>API Key</label>
                    <input
                        type="password"
                        value={config.apiKey || ''}
                        onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
                        placeholder="sk-..."
                    />
                </div>
            )}

            {config.provider === 'gemini' && (
                <div className="form-group">
                    <label>API Key</label>
                    <input
                        type="password"
                        value={config.apiKey || ''}
                        onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
                        placeholder="AIza..."
                    />
                </div>
            )}

            {config.provider === 'ollama' && (
                <div className="form-group">
                    <label>Base URL</label>
                    <input
                        type="text"
                        value={config.baseUrl || 'http://localhost:11434'}
                        onChange={(e) => onConfigChange({ ...config, baseUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                    />
                </div>
            )}

            <div className="form-group">
                <label>Model</label>
                <select
                    value={config.model}
                    onChange={(e) => onConfigChange({ ...config, model: e.target.value })}
                    disabled={loadingModels}
                >
                    {models.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                {loadingModels && <span className="loading-text">Loading models...</span>}
            </div>
        </div>
    );
};
