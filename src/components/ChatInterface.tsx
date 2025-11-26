import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LLMMessage, LLMConfig, LLMProvider } from '../types';
import { OpenAIProvider } from '../services/llm/openai';
import { GeminiProvider } from '../services/llm/gemini';
import { OllamaProvider } from '../services/llm/ollama';
import { knowledgeBase } from '../services/knowledge-base';
import { searchDuckDuckGo } from '../services/web-search';
import { fetchUrlContent, getDomainFromUrl } from '../services/web-scraper';
import { VoiceInput } from './VoiceInput';

interface ChatInterfaceProps {
    config: LLMConfig;
    useKnowledgeBase: boolean;
    useWebSearch: boolean;
}

const UserAvatar = () => (
    <div className="avatar user-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    </div>
);

const BotAvatar = () => (
    <div className="avatar bot-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
        </svg>
    </div>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ config, useKnowledgeBase, useWebSearch }) => {
    const [messages, setMessages] = useState<LLMMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [webStatus, setWebStatus] = useState<string>('');
    const [voiceInterimTranscript, setVoiceInterimTranscript] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, webStatus, isLoading]);

    const handleSubmit = async (e?: React.FormEvent, messageText?: string) => {
        e?.preventDefault();
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: LLMMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Enforce source selection
        if (!useKnowledgeBase && !useWebSearch) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Please enable **Use Knowledge Base** or **🔍 Search Web** to proceed.\n\nYou also need to ensure you have added content (PDFs or Web links) for me to answer your queries.'
                }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        try {
            let provider: LLMProvider;
            switch (config.provider) {
                case 'openai': provider = OpenAIProvider; break;
                case 'gemini': provider = GeminiProvider; break;
                case 'ollama': provider = OllamaProvider; break;
                default: throw new Error('Unknown provider');
            }

            const newMessages = [...messages, userMessage];
            let messagesToSend = newMessages;
            let webSearchContext = '';

            // Web Search - fetch top 5 URLs if enabled
            if (useWebSearch) {
                setWebStatus('🔍 Searching the web...');
                try {
                    const searchResults = await searchDuckDuckGo(textToSend, 5);
                    setWebStatus(`📄 Fetching content from ${searchResults.length} URLs...`);

                    const contentPromises = searchResults.map(async (result, index) => {
                        try {
                            setWebStatus(`📄 Fetching ${index + 1}/${searchResults.length}: ${getDomainFromUrl(result.url)}...`);
                            const content = await fetchUrlContent(result.url);
                            // Limit content to first 2000 characters
                            const truncatedContent = content.slice(0, 2000);
                            return {
                                title: result.title,
                                url: result.url,
                                content: truncatedContent,
                                snippet: result.snippet
                            };
                        } catch (err) {
                            console.error('Failed to fetch URL:', result.url, err);
                            return null;
                        }
                    });

                    const results = await Promise.allSettled(contentPromises);
                    const successfulResults = results
                        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
                        .map(r => r.value);

                    if (successfulResults.length > 0) {
                        webSearchContext = successfulResults.map((result, idx) =>
                            `${idx + 1}. **${result.title}** - ${result.url}\n${result.snippet}\n\nContent:\n${result.content}`
                        ).join('\n\n---\n\n');
                    }
                    setWebStatus('');
                } catch (err) {
                    console.error('Web search failed:', err);
                    setWebStatus('');
                }
            }

            // Knowledge Base search if enabled
            if (useKnowledgeBase) {
                // Search knowledge base
                const relevantChunks = await knowledgeBase.searchDocuments(textToSend, 3);
                if (relevantChunks.length > 0) {
                    const context = relevantChunks.join('\n\n---\n\n');
                    const systemMessage: LLMMessage = {
                        role: 'system',
                        content: `You are a helpful assistant with access to a knowledge base. Use the following sources to help answer the user's question.

IMPORTANT CITATION INSTRUCTIONS:
1. When using information from these sources, cite them by mentioning the source name
2. Quote the exact relevant text in double quotes when referencing specific information
3. Format citations like: According to [Source Name], "exact quoted text"
4. If information comes from a web page or PDF, mention it explicitly
5. If you use multiple sources, cite each one separately

AVAILABLE SOURCES:
${context}

If the sources don't contain relevant information, you may use your general knowledge but clearly indicate when you're doing so.`
                    };
                    messagesToSend = [systemMessage, ...newMessages];
                }
            }

            // Add web search context if available
            if (webSearchContext) {
                const webSystemMessage: LLMMessage = {
                    role: 'system',
                    content: `You are answering based on current web search results. Use this information to provide an accurate, up-to-date answer.

Search Query: "${textToSend}"

WEB SEARCH RESULTS:
${webSearchContext}

Please answer the user's question using the above search results. Cite sources by mentioning the title and URL.`
                };
                // If there's already a system message, combine them
                if (messagesToSend[0]?.role === 'system') {
                    messagesToSend[0].content = webSystemMessage.content + '\n\n---\n\n' + messagesToSend[0].content;
                } else {
                    messagesToSend = [webSystemMessage, ...messagesToSend];
                }
            }

            const stream = await provider.chat(messagesToSend, config);

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            for await (const chunk of stream) {
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    const others = prev.slice(0, -1);
                    return [...others, { ...last, content: last.content + chunk }];
                });
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
            setWebStatus('');
        }
    };

    const handleVoiceTranscript = (transcript: string) => {
        if (transcript.trim()) {
            setVoiceInterimTranscript(''); // Clear interim when final transcript received
            handleSubmit(undefined, transcript);
        }
    };

    const handleVoiceInterimTranscript = (transcript: string) => {
        setVoiceInterimTranscript(transcript);
    };

    return (
        <div className="chat-interface">
            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="welcome-message">
                        <div className="welcome-icon">✨</div>
                        <h2>How can I help you today?</h2>
                        <p>Ask me anything or upload documents to get started.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-wrapper ${msg.role}`}>
                        {msg.role === 'assistant' && <BotAvatar />}
                        <div className={`message-bubble ${msg.role}`}>
                            {msg.role === 'assistant' && <div className="message-sender">AI Assistant</div>}
                            <div className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                        {msg.role === 'user' && <UserAvatar />}
                    </div>
                ))}

                {webStatus && (
                    <div className="status-indicator">
                        <span className="spinner">⚡</span> {webStatus}
                    </div>
                )}

                {isLoading && !webStatus && (
                    <div className="message-wrapper assistant">
                        <BotAvatar />
                        <div className="message-bubble assistant typing">
                            <div className="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <form onSubmit={handleSubmit} className="input-form">
                    <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        onInterimTranscript={handleVoiceInterimTranscript}
                        disabled={isLoading}
                    />
                    <textarea
                        value={voiceInterimTranscript || input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setVoiceInterimTranscript(''); // Clear voice transcript if user types
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Type a message or use voice..."
                        disabled={isLoading}
                        rows={1}
                    />
                    <button type="submit" className="send-button" disabled={isLoading || (!input.trim() && !voiceInterimTranscript.trim())}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
