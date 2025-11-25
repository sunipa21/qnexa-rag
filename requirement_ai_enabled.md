# AI Enabled Knowledge Management Application Requirements

## Overview
Create an end-to-end web application that allows users to interact with multiple LLM providers.

## Core Features
1.  **Multi-Provider Support**:
    - **OpenAI**: Users can input their API Key.
    - **Google Gemini**: Users can input their API Key.
    - **Ollama**: Local inference support (defaulting to `http://localhost:11434`).

2.  **User Interface**:
    - **Settings Panel**:
        - Input fields for API Keys (OpenAI, Gemini).
        - Configuration for Ollama URL.
        - Model selection dropdown (dynamic based on provider).
    - **Chat Interface**:
        - Message history view.
        - Input area for user prompts.
        - Markdown rendering for LLM responses.

3.  **Technical Requirements**:
    - **Frontend**: React + Vite + TypeScript.
    - **Styling**: Modern, responsive Vanilla CSS.
    - **State Management**: Local persistence for keys and preferences.
    - **Security**: Keys should strictly be stored on the client side (localStorage) and never sent to a backend server (except the LLM provider APIs directly).