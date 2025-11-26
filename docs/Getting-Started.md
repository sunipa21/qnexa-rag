# Getting Started with Qnexa AI

This guide will help you set up and run Qnexa AI on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js**: Version 18.0.0 or higher.
    -   [Download Node.js](https://nodejs.org/)
2.  **Git**: For version control.
    -   [Download Git](https://git-scm.com/)
3.  **Ollama** (Optional): For running local LLMs.
    -   [Download Ollama](https://ollama.com/)

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/sunipa21/AI_Enabled_Knowledge_Management.git
    cd AI_Enabled_Knowledge_Management
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the Development Server**
    ```bash
    npm run dev
    ```

2.  **Open in Browser**
    Navigate to `http://localhost:5173` to view the application.

## Configuration

### Setting up API Keys
Qnexa AI supports multiple LLM providers. You can configure them in the **Settings** panel (gear icon).

-   **OpenAI**: Enter your API key. It is stored in `localStorage`.
-   **Google Gemini**: Enter your API key. It is stored in `localStorage`.

### Setting up Ollama (Local LLM)
To use local models with Ollama:

1.  **Install Ollama** from [ollama.com](https://ollama.com/).
2.  **Pull a Model** (e.g., Llama 3):
    ```bash
    ollama pull llama3
    ```
3.  **Configure CORS**:
    By default, Ollama blocks cross-origin requests. To allow the web app to connect, run Ollama with the `OLLAMA_ORIGINS` environment variable:
    ```bash
    OLLAMA_ORIGINS="*" ollama serve
    ```
4.  **Connect in App**:
    In Qnexa AI Settings, ensure the Ollama URL is set to `http://localhost:11434` (default).

## Troubleshooting

### "Failed to fetch" Error with Ollama
-   **Cause**: CORS issues or Ollama is not running.
-   **Fix**: Ensure you ran `OLLAMA_ORIGINS="*" ollama serve` and that the server is active.

### Application not loading
-   **Cause**: Node.js version mismatch or missing dependencies.
-   **Fix**: Run `node -v` to check version (must be >= 18) and run `npm install` again.
