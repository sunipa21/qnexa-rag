# AI Knowledge Manager - Requirements Document

## Project Overview

**AI Knowledge Manager** is a comprehensive web application that combines Large Language Model (LLM) capabilities with an intelligent knowledge base management system. The application enables users to interact with multiple AI providers while maintaining a local knowledge base of documents and web content for context-aware AI responses.

---

## Core Features

### 1. Multi-Provider LLM Support

The application supports three different LLM providers, allowing users to choose based on their preferences and requirements:

#### **OpenAI Integration**
- Users can input their OpenAI API key
- Support for various OpenAI models (GPT-3.5, GPT-4, etc.)
- Real-time streaming responses
- Model selection dropdown with dynamic model fetching

#### **Google Gemini Integration**
- Users can input their Google Gemini API key
- Support for Gemini models (gemini-pro, etc.)
- Real-time streaming responses
- Dynamic model selection

#### **Ollama (Local LLM) Integration**
- Local inference support (defaulting to `http://localhost:11434`)
- No API key required
- Configurable base URL for custom Ollama instances
- Support for models like llama3, mistral, etc.
- Privacy-focused with completely local processing

### 2. Knowledge Base Management

A powerful document management system that allows users to build a searchable knowledge base:

#### **PDF Document Upload**
- Upload PDF files directly to the knowledge base
- Automatic text extraction from PDFs
- Smart chunking of document content (500 character chunks with 50 character overlap)
- Progress tracking during upload and processing
- Real-time embedding generation with progress indicator

#### **Web Content Integration**
- Add web pages by URL
- Automatic content extraction and cleaning
- Metadata preservation (source URL, domain)
- Supports various web formats

#### **Document Organization**
- View all uploaded documents with metadata
  - Document name
  - Source type (PDF, URL)
  - Number of chunks
  - Upload date
  - Source link (for URLs)
- Visual indicators for documents with embeddings
- Storage size tracking
- Vector count statistics

#### **Search & Retrieval**
- Vector-based semantic search using AI embeddings
- Relevance scoring for search results
- Top-K retrieval (configurable)
- Context-aware responses using retrieved documents

#### **Document Deletion**
- Delete individual documents
- Bulk delete by source type (all PDFs or all URLs)
- Clear entire knowledge base
- Confirmation modals for destructive actions

### 3. Chat Interface

Intuitive conversational interface for interacting with LLMs:

#### **Message Handling**
- Send queries to selected LLM provider
- View conversation history
- Markdown rendering for AI responses
- Support for formatted text, code blocks, tables, etc.
- Message roles (user, assistant, system)

#### **Knowledge Base Integration**
- Toggle to enable/disable knowledge base usage
- Automatic context injection from relevant documents
- Cited sources in AI responses
- Relevance scores for retrieved information

#### **Streaming Responses**
- Real-time response generation
- Character-by-character streaming for natural feel
- Loading indicators during response generation

### 4. Settings & Configuration

Comprehensive settings panel for customizing the application:

#### **Provider Configuration**
- Provider selection (OpenAI, Gemini, Ollama)
- API key input fields with secure client-side storage
- Base URL configuration for Ollama
- Model selection dropdown (dynamic based on provider)

#### **Embedding Configuration**
- Multiple embedding providers support
  - Transformers.js (local, browser-based)
  - OpenAI embeddings
  - Gemini embeddings
- API key management for embedding services

#### **Persistence**
- All settings stored in browser localStorage
- API keys never sent to backend servers
- Configuration persists across sessions
- Knowledge base toggle state persistence

### 5. Vector Database Support

Dual vector database implementation for flexibility:

#### **ChromaDB Integration**
- Modern vector database support
- Optimized for large-scale vector operations
- Automatic initialization and fallback

#### **IndexedDB Fallback**
- Browser-native vector storage
- Works offline without external dependencies
- Automatic fallback when ChromaDB unavailable
- Cosine similarity search implementation

### 6. Embedding Generation

Advanced text embedding capabilities:

#### **Multiple Embedding Providers**
- **Transformers.js**: Client-side, privacy-focused, no API required
- **OpenAI Embeddings**: High-quality embeddings via API
- **Gemini Embeddings**: Google's embedding models

#### **Features**
- Batch processing for efficiency
- Progress tracking with time estimates
- Automatic retries on failure
- Metadata association with embeddings

### 7. User Experience Features

#### **Responsive Design**
- Modern, clean interface
- Sidebar for settings and knowledge base
- Resizable sidebar (drag to adjust width)
- Responsive layout for different screen sizes

#### **Progress Indicators**
- Embedding generation progress bars
- Percentage completion indicators
- Estimated time remaining
- Status messages for all operations

#### **Error Handling**
- User-friendly error messages
- Graceful degradation
- Automatic fallbacks for services

#### **Visual Feedback**
- Icons for different document sources (📄 PDF, 🌐 URL, 🔍 Search)
- Status badges (🧠 for embedded documents)
- Color-coded UI elements
- Loading states and animations

---

## Technical Requirements

### Functional Requirements

1. **Multi-Provider LLM Communication**
   - Support streaming responses from all providers
   - Handle API authentication securely
   - Dynamic model fetching and selection
   - Error handling for API failures

2. **Document Processing**
   - Extract text from PDF files
   - Scrape and clean web content
   - Chunk texts intelligently with overlap
   - Generate embeddings for all chunks

3. **Vector Search**
   - Semantic similarity search
   - Configurable top-K retrieval
   - Relevance scoring
   - Fast query performance

4. **Data Persistence**
   - Store documents in browser storage
   - Persist user settings and preferences
   - Cache embeddings in vector database
   - Maintain chat history

### Non-Functional Requirements

1. **Security**
   - Client-side API key storage only
   - No server-side storage of sensitive data
   - Keys sent directly to respective LLM providers
   - Secure HTTPS connections for API calls

2. **Performance**
   - Fast document upload and processing
   - Efficient embedding generation
   - Quick vector search (<1 second)
   - Smooth UI interactions

3. **Usability**
   - Intuitive interface design
   - Clear visual feedback
   - Helpful error messages
   - Minimal learning curve

4. **Reliability**
   - Graceful error handling
   - Automatic fallbacks (ChromaDB → IndexedDB)
   - Data validation and sanitization
   - Robust state management

---

## Use Cases

### Use Case 1: Research Assistant
A researcher uploads multiple PDF research papers and queries the AI for specific information across all documents. The knowledge base retrieves relevant sections and the LLM synthesizes a comprehensive answer with proper citations.

### Use Case 2: Web Content Analysis
A user adds multiple URLs about a topic and asks the AI to compare and contrast the different perspectives. The system retrieves relevant content from each source and provides a balanced analysis.

### Use Case 3: Local Privacy-Focused Usage
A privacy-conscious user uses Ollama with Transformers.js embeddings to have completely local AI interactions without sending any data to external services.

### Use Case 4: Multi-Source Knowledge Query
A user maintains a knowledge base with both PDFs and web content, then queries for information that draws from multiple sources, receiving a comprehensive answer with citations.

---

## Future Enhancement Possibilities

1. Support for more document formats (DOCX, TXT, Markdown)
2. Web search integration for real-time information
3. Export chat conversations
4. Custom embedding model configuration
5. Advanced filtering and search options
6. Document folders and organization
7. Multi-language support
8. Collaborative knowledge bases
9. Mobile application version
10. Cloud sync for knowledge base

---

## Summary

AI Knowledge Manager is a powerful, flexible application that democratizes access to AI capabilities while providing sophisticated knowledge management features. It prioritizes user privacy, supports multiple AI providers, and enables intelligent, context-aware conversations backed by a searchable knowledge base.
