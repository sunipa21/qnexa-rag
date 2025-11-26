# API Reference

This section documents the internal modules and hooks available for developers contributing to Qnexa AI.

## Custom Hooks

### `useChat`
Manages the chat state, message history, and LLM interactions.

```typescript
const { messages, sendMessage, isLoading, stopGeneration } = useChat();
```

-   **messages**: Array of `LLMMessage` objects.
-   **sendMessage(content: string)**: Sends a user prompt to the configured LLM.
-   **isLoading**: Boolean indicating if the AI is currently generating a response.
-   **stopGeneration**: Function to abort the current stream.

### `useVoice`
Handles speech recognition and synthesis.

```typescript
const { isListening, startListening, stopListening, speak } = useVoice();
```

-   **isListening**: Boolean status of the microphone.
-   **startListening()**: Activates the Web Speech API recognition.
-   **speak(text: string)**: Uses `window.speechSynthesis` to read text aloud.

## Services

### `LLMService`
The unified interface for all LLM providers.

-   `streamChat(messages, config, onToken)`: Main method for generating streaming responses.
-   `generateEmbedding(text)`: Creates vector embeddings for RAG.

### `VectorStore`
Manages the local vector database.

-   `addDocument(doc)`: Processes and indexes a document.
-   `search(query, k)`: Returns the top `k` most similar document chunks.
