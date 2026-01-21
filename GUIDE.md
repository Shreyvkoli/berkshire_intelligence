
# Berkshire Hathaway Intelligence (Groq + Neon Edition)

This RAG application uses:
*   **Mastra**: Agent framework
*   **Groq (Llama 3)**: LLM Provider (Free Tier)
*   **Neon (Postgres)**: Vector Database (Free Tier)
*   **Xenova/Transformers**: Local Embeddings (Free, runs on CPU)

## Prerequisites

1.  **Neon Database**:
    *   Create a project at [neon.tech](https://neon.tech).
    *   Get the Connection String (ensure it includes the password).
    *   Example: `postgres://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require`

2.  **Groq API Key**:
    *   Get a key from [console.groq.com](https://console.groq.com).

## Setup

1.  **Environment Variables**:
    Update `.env` file:
    ```env
    GROQ_API_KEY=your_groq_key
    POSTGRES_CONNECTION_STRING=your_neon_connection_string
    OPENAI_API_KEY=your_groq_key  # Mastra uses this for compatibility
    OPENAI_BASE_URL=https://api.groq.com/openai/v1
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Ingest Data**:
    This script reads PDFs from `data/`, generates embeddings using Xenova (locally), and stores them in Neon Postgres.
    ```bash
    npx tsx src/ingest.ts
    ```

4.  **Run Server**:
    ```bash
    npm run dev
    ```

5.  **Chat**:
    Open `http://localhost:4111`.

## Deployment (Vercel)

1.  Push this code to GitHub.
2.  Import project in Vercel.
3.  Add the Environment Variables in Vercel Settings (`GROQ_API_KEY`, `POSTGRES_CONNECTION_STRING`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`).
4.  Deploy.
