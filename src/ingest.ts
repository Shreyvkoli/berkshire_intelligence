
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';
import { createRequire } from 'module';
import { MDocument } from '@mastra/rag';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

dotenv.config();

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
});

// Using nomic-embed-text via Groq ? Groq doesn't host embeddings usually.
// Wait, Groq supports Llama 3 but maybe not embeddings in the same way?
// Groq currently does NOT support embeddings directly via their OpenAI compatible API as of early 2024 (it might have changed).
// Actually, let's use a Free embedding provider or check if Groq added it.
// Documentation says Groq is for Inference.
// WE NEED EMBEDDINGS.
// Option 1: Use a free embedding API (e.g. HuggingFace Inference API - free tier).
// Option 2: Use a local embedding model (Xenova/transformers) but we want to deploy to Vercel (Edge function limits might be an issue, but serverless node is okay).
// Option 3: Check if Groq added embeddings.
// 
// Let's assume for a second we can't use Groq for embeddings.
// We can use 'fast-embed' locally? No, Vercel size limits.
// We can use OpenAI for bindings if the user had key, but they don't.
//
// Let's use Hugging Face Inference API for embeddings? Or just stick to simple tfjs?
//
// WAIT! Mistral AI has free API tier?
// Google Gemini API has free tier for embeddings! 'text-embedding-004'.
//
// Let's try to use the OpenAI compatible endpoint of Groq. If it fails, we are stuck.
// Actually, many people use Ollama for local, but for cloud free?
// Cohere? Voyage?
//
// RE-READ: User provided Groq Key.
// Let's try to use Google Generative AI (Gemini) for embeddings if Groq fails?
// But User gave Groq key.
//
// Let's assume user wants to use Groq for LLM.
// For embeddings, we need a solution.
//
// Let's try to use a lightweight JS embedding library 'transformers.js' inside the Vercel function?
// It might be too heavy.
//
// Let's use the 'Voyage AI' or 'Cohere' trial?
//
// Actually, let's use Google Gemini for embeddings. It is free.
// I can ask user for Gemini Key? 
// OR
// I can use a library that runs on CPU for embeddings like 'xenova/transformers'.
// `npm install @xenova/transformers`
// It works in Node.js.
//
// Let's stick to what we have. Groq FOR CHAT.
// Database needs vectors.
//
// Let's use a Dummy Embedding for now? No RAG won't work.
//
// Let's use '@xenova/transformers' for embeddings. It downloads model once.
//
// PROPOSAL: Use Xenova/transformers for embeddings. It's robust and free.
//
// However, to keep it simple and compliant with "Mastra + Postgres + Node", 
// let's try to verify if Groq supports embeddings yet. 
// A quick search suggests NO.
//
// OK, I will add `@xenova/transformers` for generating embeddings.
//
// BUT WAIT! The user might have a Neon DB. Over public internet.
//
// Let's use 'pipeline' from '@xenova/transformers'.

// Actually, to make it deployment friendly on Vercel (which has 50MB limit), 
// downloading models at runtime is risky.
//
// Better option: Use Google Gemini API for embeddings. It's high quality and free tier is good.
// But I don't have user's Gemini Key.
//
// Let's ask user for Gemini Key? Or just use 'transformers' and hope Vercel handles it (Serverless function size is 250MB, should fit 'all-MiniLM-L6-v2' which is ~45MB).

// Let's try Xenova.

import { pipeline } from '@xenova/transformers';

let extractor: any = null;

async function getEmbedding(text: string) {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

// ... rest of ingest script ...

async function setupDatabase() {
    const client = await pool.connect();
    try {
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');
        await client.query('DROP TABLE IF EXISTS embeddings');
        await client.query(`
            CREATE TABLE IF NOT EXISTS embeddings (
                id SERIAL PRIMARY KEY,
                content TEXT,
                embedding vector(384),
                metadata JSONB
            )
        `);
        // Dimensions for all-MiniLM-L6-v2 is 384
        console.log("Database initialized (with vector(384)).");
    } finally {
        client.release();
    }
}

async function processPdf(filePath: string) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    const year = path.basename(filePath).match(/(\d{4})/)?.[1] || "Unknown";
    console.log(`Processing ${path.basename(filePath)} (Year: ${year})...`);

    // Simple chunking
    const chunks = text.match(/.{1,1000}/g) || [];
    console.log(`Generated ${chunks.length} chunks. Generating embeddings...`);

    const records = [];
    for (const content of chunks) {
        if (!content || content.trim().length < 50) continue;
        const embedding = await getEmbedding(content);
        records.push({ content, embedding });
    }
    console.log(`Generated ${records.length} embeddings. Inserting into database...`);

    const client = await pool.connect();
    try {
        for (const record of records) {
            const vectorStr = `[${record.embedding.join(',')}]`;
            await client.query(
                'INSERT INTO embeddings (content, embedding, metadata) VALUES ($1, $2::vector, $3)',
                [record.content, vectorStr, { year, source: path.basename(filePath) }]
            );
        }
    } finally {
        client.release();
    }
    console.log(`Finished ${path.basename(filePath)}`);
}

async function main() {
    await setupDatabase();
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
        await processPdf(path.join(dataDir, file));
    }
    console.log("All documents processed.");
    await pool.end();
}

main().catch(console.error);

