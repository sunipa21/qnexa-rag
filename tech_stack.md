# AI Knowledge Manager - Tech Stack Documentation

## Technology Stack Overview

This document provides a comprehensive overview of the technologies, libraries, and frameworks used in the AI Knowledge Manager application, along with detailed explanations of how each technology is utilized.

---

## Frontend Framework & Build Tools

### **React 19.2.0**
- **Purpose**: Core UI framework for building the application
- **Usage**:
  - Component-based architecture for modular UI development
  - Hooks for state management (`useState`, `useEffect`)
  - Functional components throughout the application
  - Main components: `App.tsx`, `ChatInterface.tsx`, `KnowledgeBase.tsx`, `Settings.tsx`

### **TypeScript 5.9.3**
- **Purpose**: Static type checking and enhanced developer experience
- **Usage**:
  - Type definitions for all components and services
  - Interface definitions (`LLMConfig`, `LLMMessage`, `Document`, `LLMProvider`)
  - Compile-time error detection
  - Enhanced IDE support and autocomplete
  - Type-safe API interactions

### **Vite 7.2.4**
- **Purpose**: Modern build tool and development server
- **Usage**:
  - Fast hot module replacement (HMR) during development
  - Optimized production builds
  - ES modules-based architecture
  - Quick development server startup
  - Efficient bundling and code splitting

### **@vitejs/plugin-react 5.1.1**
- **Purpose**: React integration for Vite
- **Usage**:
  - Fast Refresh for instant feedback during development
  - JSX/TSX transformation
  - Babel integration for React features

---

## Styling

### **Vanilla CSS**
- **Purpose**: Custom styling with maximum flexibility
- **Usage**:
  - `index.css`: Global styles and design system (17KB of custom styles)
  - `modal.css`: Modal component styles
  - `App.css`: Application-specific styles
  - CSS custom properties for theming
  - Responsive design with flexbox and grid
  - Modern UI with glassmorphism effects and animations

---

## AI & Machine Learning Libraries

### **@xenova/transformers 2.17.2**
- **Purpose**: Client-side machine learning and text embeddings
- **Usage**:
  - Browser-based text embedding generation
  - Privacy-focused local processing (no data sent to servers)
  - Used in `services/embeddings.ts` for generating vector embeddings
  - Supports various transformer models
  - No API key required for basic functionality
  - Enables offline embedding generation

### **OpenAI API** (via fetch)
- **Purpose**: Access to GPT models and OpenAI embeddings
- **Usage**:
  - Chat completions with streaming support
  - Text embeddings via OpenAI's embedding models
  - Implemented in `services/llm/` directory
  - API key provided by user, stored client-side
  - Real-time response streaming

### **Google Gemini API** (via fetch)
- **Purpose**: Access to Google's Gemini LLM models
- **Usage**:
  - Chat completions with streaming support
  - Alternative embedding generation
  - Implemented in `services/llm/` directory
  - User-provided API key
  - Streaming response support

### **Ollama** (Local LLM)
- **Purpose**: Local LLM inference without external API calls
- **Usage**:
  - Privacy-focused local model execution
  - Default endpoint: `http://localhost:11434`
  - Support for multiple open-source models (llama3, mistral, etc.)
  - No API key required
  - Complete data privacy

---

## Vector Database & Storage

### **ChromaDB 3.1.5**
- **Purpose**: Modern vector database for semantic search
- **Usage**:
  - Primary vector storage solution
  - Implemented in `services/chroma-db.ts`
  - Fast similarity search for document retrieval
  - Metadata storage alongside vectors
  - Collection management for organized data
  - Cosine similarity distance metric
  - Batch vector operations for efficiency

### **IndexedDB** (Native Browser API)
- **Purpose**: Fallback vector database when ChromaDB unavailable
- **Usage**:
  - Implemented in `services/vector-db.ts`
  - Browser-native storage solution
  - Cosine similarity search implementation
  - Works offline without external dependencies
  - Automatic fallback mechanism
  - Stores embeddings with associated metadata

### **LocalStorage** (Native Browser API)
- **Purpose**: Client-side configuration and document metadata storage
- **Usage**:
  - Store user settings and LLM configuration
  - Persist API keys (client-side only, never sent to backend)
  - Save knowledge base documents metadata
  - Store user preferences (knowledge base toggle, sidebar width)
  - Session persistence across browser restarts

---

## Document Processing

### **pdfjs-dist 5.4.394**
- **Purpose**: PDF parsing and text extraction
- **Usage**:
  - Implemented in `services/pdf-parser.ts`
  - Extract text content from uploaded PDF files
  - Parse PDF structure and pages
  - Convert PDFs to machine-readable text
  - Support for various PDF formats
  - Worker-based processing for non-blocking operations

### **Custom Web Scraper**
- **Purpose**: Extract content from web URLs
- **Usage**:
  - Implemented in `services/web-scraper.ts`
  - Fetch and parse HTML content
  - Clean and extract meaningful text
  - Remove scripts, styles, and unnecessary tags
  - Extract metadata (domain, title)
  - CORS handling for web requests

---

## Markdown & Content Rendering

### **react-markdown 10.1.0**
- **Purpose**: Render markdown content in React components
- **Usage**:
  - Display formatted LLM responses
  - Support for various markdown elements
  - Code syntax highlighting
  - Lists, tables, headers, links, etc.
  - Used in `ChatInterface.tsx` for rendering AI responses

### **remark-gfm 4.0.1**
- **Purpose**: GitHub Flavored Markdown support
- **Usage**:
  - Extended markdown syntax
  - Tables, task lists, strikethrough
  - Autolink literals
  - Enhanced markdown rendering in AI responses

---

## Code Quality & Development Tools

### **ESLint 9.39.1**
- **Purpose**: Code linting and quality enforcement
- **Usage**:
  - Static code analysis
  - Enforce coding standards
  - Detect potential bugs
  - Configured in `eslint.config.js`

### **@eslint/js 9.39.1**
- **Purpose**: ESLint's JavaScript rules
- **Usage**:
  - Core JavaScript linting rules
  - RecommendedRuleset

### **eslint-plugin-react-hooks 7.0.1**
- **Purpose**: Enforce React Hooks rules
- **Usage**:
  - Ensure proper hook usage
  - Prevent hook-related bugs
  - Dependencies array validation

### **eslint-plugin-react-refresh 0.4.24**
- **Purpose**: React Fast Refresh support in development
- **Usage**:
  - Ensure components are Fast Refresh compatible
  - Better development experience

### **typescript-eslint 8.46.4**
- **Purpose**: TypeScript-specific linting rules
- **Usage**:
  - Type-aware linting
  - TypeScript best practices
  - Integration between ESLint and TypeScript

### **globals 16.5.0**
- **Purpose**: Global variable definitions for linting
- **Usage**:
  - Provide global variable definitions
  - Prevent false-positive linting errors

---

## Type Definitions

### **@types/react 19.2.5**
- **Purpose**: TypeScript definitions for React
- **Usage**:
  - Type safety for React APIs
  - Component prop types
  - Hook types

### **@types/react-dom 19.2.3**
- **Purpose**: TypeScript definitions for ReactDOM
- **Usage**:
  - Type safety for DOM rendering
  - Event handler types

### **@types/node 24.10.1**
- **Purpose**: TypeScript definitions for Node.js APIs
- **Usage**:
  - Type safety for Node.js built-ins
  - Used in build configuration

---

## Architecture & Design Patterns

### **Component-Based Architecture**
- Modular, reusable UI components
- Clear separation of concerns
- Props-based component communication

### **Service Layer Pattern**
- Business logic separated from UI
- Reusable service modules:
  - `services/embeddings.ts` - Embedding generation
  - `services/knowledge-base.ts` - Knowledge base management
  - `services/llm/*` - LLM provider integrations
  - `services/pdf-parser.ts` - PDF processing
  - `services/web-scraper.ts` - Web content extraction
  - `services/chroma-db.ts` - Vector database operations
  - `services/vector-db.ts` - IndexedDB vector storage

### **Singleton Pattern**
- Single instance for knowledge base (`knowledgeBase`)
- Consistent state across the application

### **Factory Pattern**
- Dynamic LLM provider selection
- Pluggable embedding providers

### **State Management**
- React hooks for local state
- LocalStorage for persistence
- No external state management library (Redux, MobX) needed

---

## Key Technical Features

### **Streaming API Support**
- Real-time response streaming from LLMs
- Character-by-character rendering
- AsyncGenerator pattern for streaming data

### **Progress Tracking**
- Real-time progress indicators for long-running operations
- Time estimation algorithms
- Percentage completion displays

### **Error Handling & Fallbacks**
- Try-catch blocks for error management
- Graceful degradation (ChromaDB → IndexedDB)
- User-friendly error messages

### **Chunking Algorithm**
- Intelligent text chunking with overlap
- Configurable chunk size (500 chars) and overlap (50 chars)
- Maintains context across chunks

### **Vector Similarity Search**
- Cosine similarity implementation
- Top-K retrieval
- Relevance scoring

### **Batch Processing**
- Batch embedding generation
- Batch vector insertion
- Progress callbacks

---

## Browser APIs Used

1. **LocalStorage**: Persistent client-side storage
2. **IndexedDB**: Browser database for vectors
3. **Fetch API**: HTTP requests to LLM providers
4. **FileReader**: Reading uploaded PDF files
5. **Web Workers**: (via pdfjs-dist) Non-blocking PDF processing

---

## Build Configuration

### **TypeScript Configuration**
- `tsconfig.json`: Root configuration
- `tsconfig.app.json`: App-specific config (732 bytes)
- `tsconfig.node.json`: Node/build config (653 bytes)
- Strict type checking enabled
- ES module output

### **Vite Configuration** (`vite.config.ts`)
- React plugin integration
- Development server configuration
- Build optimization settings

---

## NPM Scripts

```json
{
  "dev": "vite",                    // Start development server
  "build": "tsc -b && vite build",  // Build for production
  "lint": "eslint .",               // Run linter
  "preview": "vite preview"         // Preview production build
}
```

---

## Deployment Considerations

### **Static Deployment**
- Application builds to static files
- Can be deployed to:
  - Vercel
  - Netlify
  - GitHub Pages
  - AWS S3 + CloudFront
  - Any static hosting service

### **No Backend Required**
- Fully client-side application
- Direct API calls to LLM providers
- No server-side code needed
- Reduced hosting costs

### **Environment Requirements**
- Modern browser with ES6+ support
- IndexedDB support
- LocalStorage enabled
- For Ollama: Local Ollama instance running

---

## Security Considerations

### **API Key Management**
- Keys stored in browser LocalStorage only
- Never transmitted to any backend server
- Keys sent directly to respective API providers
- User responsible for key security

### **CORS**
- Direct API calls require CORS support
- Modern browsers handle cross-origin requests
- Alternative: proxy server for stricter CORS policies

### **Data Privacy**
- Option for completely local processing (Ollama + Transformers.js)
- No data collection or tracking
- Documents stored locally in browser

---

## Performance Optimizations

1. **Code Splitting**: Vite automatically splits code for faster loading
2. **Lazy Loading**: Components and services loaded as needed
3. **Batch Operations**: Batch vector insertions for efficiency
4. **Web Workers**: PDF processing in background threads
5. **Streaming**: Progressive response rendering
6. **Caching**: Embeddings cached in vector database

---

## Summary

The AI Knowledge Manager utilizes a modern, efficient tech stack that prioritizes:
- **Performance**: Fast build tools (Vite) and optimized libraries
- **Developer Experience**: TypeScript, ESLint, React 19
- **User Privacy**: Client-side processing, local storage options
- **Flexibility**: Multiple AI providers and embedding options
- **Reliability**: Fallback mechanisms and error handling
- **Maintainability**: Clean architecture, modular design

The application is built with cutting-edge web technologies while maintaining broad browser compatibility and offering users complete control over their data and AI provider choices.
