# Qnexa AI - The Central Nexus for Intelligent Queries

**Qnexa AI** is a powerful, privacy-focused Knowledge Management Application that serves as a central hub for your intelligent queries. It seamlessly integrates multiple Large Language Model (LLM) providers—including OpenAI, Google Gemini, and local Ollama instances—into a unified, modern interface.

Built with **React 19**, **TypeScript**, and **Vite**, Qnexa AI offers a premium user experience with features like voice interaction, document processing, and vector-based semantic search, all while keeping your API keys and data secure on your local device.

## 🎥 Project Demo

Check out the application in action:

<video src="https://github.com/user-attachments/assets/fe37707c-db14-4673-9e15-5e4d52d1d2da" controls="controls" style="max-width: 100%;">
</video>

## ✨ Key Features

-   **🤖 Multi-Provider Support**:
    -   **OpenAI**: Access GPT-4 and other models with your API key.
    -   **Google Gemini**: Leverage Google's latest Gemini models.
    -   **Ollama**: Run open-source models (Llama 3, Mistral, etc.) locally for complete privacy.

-   **🔒 Privacy-First Architecture**:
    -   API keys are stored strictly in your browser's `localStorage`.
    -   No backend server is required; requests go directly from your browser to the LLM provider.
    -   Option for 100% offline usage with Ollama and local embeddings.

-   **🧠 Intelligent Knowledge Base**:
    -   **Vector Search**: Uses **ChromaDB** (with IndexedDB fallback) for efficient semantic search.
    -   **Document Processing**: Upload PDFs or scrape web pages to build your personal knowledge base.
    -   **Local Embeddings**: Generates vector embeddings directly in the browser using `@xenova/transformers`.

-   **🎙️ Voice Interaction**:
    -   **Voice Input**: Speak your queries naturally using the integrated speech recognition.
    -   **Text-to-Speech**: Listen to AI responses for a hands-free experience.

-   **🎨 Modern UI/UX**:
    -   Responsive, glassmorphism-inspired design.
    -   Real-time streaming responses with Markdown rendering.
    -   Dark/Light mode support (system preference).

## 🛠️ Tech Stack

-   **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **Styling**: Vanilla CSS (Custom Design System)
-   **AI & ML**:
    -   [LangChain](https://js.langchain.com/) (Concepts)
    -   [@xenova/transformers](https://huggingface.co/docs/transformers.js) (In-browser embeddings)
    -   [Ollama](https://ollama.com/) (Local LLM)
-   **Storage**:
    -   [ChromaDB](https://www.trychroma.com/) (Vector Store)
    -   IndexedDB & LocalStorage

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   **Ollama** (Optional, for local models): [Download Ollama](https://ollama.com/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sunipa21/AI_Enabled_Knowledge_Management.git
    cd AI_Enabled_Knowledge_Management
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Visit `http://localhost:5173` in your browser.

## ⚙️ Configuration

### Setting up LLM Providers

Access the **Settings** panel by clicking the gear icon in the application.

1.  **OpenAI / Google Gemini**:
    -   Enter your API Key in the respective field.
    -   The key is saved locally to your browser.

2.  **Ollama (Local)**:
    -   Ensure Ollama is running (`ollama serve`).
    -   The app defaults to `http://localhost:11434`.
    -   **Note**: You may need to configure CORS for Ollama. Run Ollama with:
        ```bash
        OLLAMA_ORIGINS="*" ollama serve
        ```

### Screenshots

**Settings Interface:**
![Settings_Huggingface](https://github.com/user-attachments/assets/08c31ca7-5af0-4d86-a836-53851bbf7918)
![Settings_Ollama](https://github.com/user-attachments/assets/af46189d-c553-4d31-a1a4-040b48374f94)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📚 Documentation

For detailed documentation, please visit our [Project Wiki](docs/Home.md).

-   [Getting Started](docs/Getting-Started.md)
-   [Architecture](docs/Architecture.md)
-   [Features](docs/Features.md)
-   [API Reference](docs/API-Reference.md)
