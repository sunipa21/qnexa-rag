# Qnexa AI — Intelligent Knowledge Management

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat&logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Qnexa AI** is a privacy-first, fully client-side Knowledge Management application that transforms how you interact with AI. Upload your documents, add web content, and have intelligent, context-aware conversations — all without a backend server.

Your data never leaves your device unless you choose a cloud LLM provider.

---

## 🎥 Demo

<video src="https://github.com/user-attachments/assets/fe37707c-db14-4673-9e15-5e4d52d1d2da" controls="controls" style="max-width: 100%;">
</video>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Provider LLM** | OpenAI, Google Gemini, and Ollama (local) — switch seamlessly |
| 🧠 **RAG Knowledge Base** | Upload PDFs, add URLs, then query across all your content |
| 🔒 **Privacy-First** | 100% client-side; API keys never touch a backend server |
| 🎙️ **Voice I/O** | Speak your queries; listen to AI responses via TTS |
| ⚡ **Local Embeddings** | In-browser vector embeddings via `@xenova/transformers` — no API key needed |
| 🗂️ **Dual Vector Store** | ChromaDB as primary, IndexedDB as automatic offline fallback |
| 📄 **Document Processing** | PDF text extraction and web page scraping built-in |
| 🌊 **Streaming Responses** | Real-time token-by-token response rendering with Markdown support |

---

## 🏗️ Architecture

Qnexa AI is a **zero-backend, client-side RAG (Retrieval-Augmented Generation)** application:

```
User Input
    │
    ▼
[Embed Query]  ──→  @xenova/transformers | OpenAI | Gemini
    │
    ▼
[Vector Search]  ──→  ChromaDB (primary) / IndexedDB (fallback)
    │
    ▼
[Retrieve Top-K Chunks]
    │
    ▼
[Construct Prompt]  ──→  System Prompt + Retrieved Context + User Query
    │
    ▼
[LLM Inference]  ──→  OpenAI / Google Gemini / Ollama (local)
    │
    ▼
[Stream Response]  ──→  Markdown rendered in real-time
```

**Key Design Decisions:**
- No proprietary backend — direct browser ↔ LLM provider communication.
- Dual vector store with automatic fallback for offline resilience.
- All API keys stored in browser `localStorage` and sent only to their respective providers.

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Role |
|---|---|---|
| [React](https://react.dev/) | 19.x | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.x | Type-safe development |
| [Vite](https://vitejs.dev/) | 7.x | Build tool & dev server |

### AI & Machine Learning
| Technology | Role |
|---|---|
| [@xenova/transformers](https://huggingface.co/docs/transformers.js) | In-browser embeddings (WebAssembly, no API key) |
| [OpenAI API](https://platform.openai.com/) | GPT models + OpenAI embeddings |
| [Google Gemini API](https://ai.google.dev/) | Gemini models + Gemini embeddings |
| [Ollama](https://ollama.com/) | Local LLM inference (Llama 3, Mistral, etc.) |

### Storage & Vector Search
| Technology | Role |
|---|---|
| [ChromaDB](https://www.trychroma.com/) | Primary vector database |
| IndexedDB | Browser-native fallback vector store |
| LocalStorage | User settings & API key persistence |

### Document Processing
| Technology | Role |
|---|---|
| [pdfjs-dist](https://mozilla.github.io/pdf.js/) | PDF text extraction |
| Custom Web Scraper | HTML content extraction from URLs |

### Rendering
| Technology | Role |
|---|---|
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering for AI responses |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | GitHub Flavored Markdown support (tables, task lists) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Ollama** *(optional — only for local LLMs)*: [Download Ollama](https://ollama.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sunipa21/AI_Enabled_Knowledge_Management.git
cd AI_Enabled_Knowledge_Management

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build       # Outputs to dist/
npm run preview     # Preview the production build locally
```

---

## ⚙️ Configuration

All configuration is done inside the app's **Settings panel** (click the ⚙️ gear icon).

### LLM Providers

| Provider | Setup |
|---|---|
| **OpenAI** | Paste your [OpenAI API Key](https://platform.openai.com/api-keys) |
| **Google Gemini** | Paste your [Gemini API Key](https://aistudio.google.com/app/apikey) |
| **Ollama (Local)** | Run Ollama locally — no API key required |

### Ollama CORS Setup

If using Ollama, you must allow browser-based requests:

```bash
# macOS / Linux
OLLAMA_ORIGINS="*" ollama serve

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="*"; ollama serve
```

Then pull a model:

```bash
ollama pull llama3        # Recommended
ollama pull mistral       # Alternative
```

### Embedding Providers

Configure in Settings → Embeddings:
- **Transformers.js** — Fully local, no API key required *(recommended default)*
- **OpenAI Embeddings** — Requires OpenAI API key
- **Gemini Embeddings** — Requires Gemini API key

---

## 📸 Screenshots

**Settings Interface:**

![Settings — HuggingFace](https://github.com/user-attachments/assets/08c31ca7-5af0-4d86-a836-53851bbf7918)
![Settings — Ollama](https://github.com/user-attachments/assets/af46189d-c553-4d31-a1a4-040b48374f94)

---

## 📂 Project Structure

```
AI_Enabled_Knowledge_Management/
├── public/                     # Static assets
├── src/
│   ├── components/             # UI components
│   │   ├── ChatInterface.tsx   # Main chat UI with streaming
│   │   ├── KnowledgeBase.tsx   # Document management panel
│   │   ├── Settings.tsx        # Settings & config panel
│   │   ├── SettingsModal.tsx   # Modal wrapper for settings
│   │   └── VoiceInput.tsx      # Voice input component
│   ├── hooks/
│   │   └── useVoice.ts         # Voice interaction hook
│   ├── mocks/
│   │   └── chroma-default-embed.ts  # ChromaDB no-op embedding shim
│   ├── services/
│   │   ├── llm/                # LLM provider integrations
│   │   │   ├── gemini.ts       # Google Gemini integration
│   │   │   ├── huggingface.ts  # HuggingFace integration
│   │   │   ├── index.ts        # Provider router
│   │   │   ├── ollama.ts       # Ollama integration
│   │   │   └── openai.ts       # OpenAI integration
│   │   ├── chroma-db.ts        # ChromaDB vector store
│   │   ├── embeddings.ts       # Embedding provider abstraction
│   │   ├── knowledge-base.ts   # RAG orchestration logic
│   │   ├── pdf-parser.ts       # PDF text extraction
│   │   ├── speech-recognition.ts  # Browser speech API
│   │   ├── text-to-speech.ts   # TTS service
│   │   ├── vector-db.ts        # IndexedDB vector store (fallback)
│   │   ├── web-scraper.ts      # URL content extractor
│   │   └── web-search.ts       # Web search integration
│   ├── types.ts                # Shared TypeScript types
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # Entry point
├── docs/                       # Project wiki
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🗺️ Roadmap

- [ ] Support for more document formats (DOCX, TXT, Markdown)
- [ ] Export and import knowledge base
- [ ] Export chat conversations
- [ ] Advanced filtering and search options
- [ ] Document folders and tagging
- [ ] Multi-language support
- [ ] Mobile-responsive layout enhancements
- [ ] Cloud sync for knowledge base (opt-in)
- [ ] Collaborative shared knowledge bases

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m 'feat: add your feature'`
4. **Push to branch**: `git push origin feature/your-feature-name`
5. **Open a Pull Request** against `main`

Please ensure your code follows the existing TypeScript patterns and passes the linter:

```bash
npm run lint
```

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 📚 Documentation

Full documentation is available in the [`docs/`](docs/Home.md) directory:

- [Getting Started](docs/Getting-Started.md)
- [Architecture](docs/Architecture.md)
- [Features](docs/Features.md)
- [API Reference](docs/API-Reference.md)
- [Git Workflow](docs/Git-Workflow.md)
