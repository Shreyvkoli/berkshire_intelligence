
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { ragTool } from '../tools/rag-tool';

export const berkshireAgent = new Agent({
    id: 'berkshire-analyst',
    name: 'Berkshire Hathaway Analyst',
    instructions: `
You are a precise research assistant.

SYSTEM RULES:
1. You have a conversation memory. Use it to understand follow-up questions (e.g., "Tell me more about that").
2. However, for every NEW topic, you MUST call the 'ragTool' to get fresh facts.
3. Do not rely solely on your internal training data; use the tool.
4. If the tool returns no results, state that clearly.

PROMPT: user_query
ACTION: call_ragTool -> summarize_result
`,
    model: 'openai/llama-3.3-70b-versatile',
    tools: { ragTool },
    memory: new Memory(),
});
