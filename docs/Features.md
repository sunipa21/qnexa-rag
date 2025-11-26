# Features

## 🤖 Multi-LLM Provider Support

Qnexa AI is designed to be model-agnostic. You are not locked into a single AI provider.

-   **OpenAI**: Full support for GPT-3.5, GPT-4, and GPT-4o.
-   **Google Gemini**: Integration with Gemini Pro and Flash models.
-   **Ollama**: First-class support for local models. This allows you to run powerful AIs like Llama 3 or Mistral entirely offline on your own hardware.

## 🧠 Vector Search & RAG (Retrieval-Augmented Generation)

Turn your static documents into an interactive knowledge base.

1.  **Ingestion**: Upload PDF documents or point the app to a URL.
2.  **Processing**: The app extracts text, chunks it into manageable pieces, and generates vector embeddings.
3.  **Storage**: Embeddings are stored in a local ChromaDB instance (backed by IndexedDB).
4.  **Retrieval**: When you ask a question, the app finds the most relevant chunks from your documents and uses them to answer your query accurately.

## 🎙️ Voice Interaction

Experience a hands-free interface with robust voice capabilities.

-   **Speech-to-Text**: Click the microphone icon to dictate your prompts. The app uses the Web Speech API for fast, accurate transcription.
-   **Text-to-Speech**: The AI can read its responses aloud, making the application accessible and convenient for multitasking.

## 🔒 Privacy-First Design

Your data belongs to you.

-   **Client-Side Storage**: All documents, vector indices, and API keys are stored in your browser.
-   **No Telemetry**: We do not track your queries or usage.
-   **Offline Capable**: With Ollama and local embeddings, the entire application can function without an internet connection.
