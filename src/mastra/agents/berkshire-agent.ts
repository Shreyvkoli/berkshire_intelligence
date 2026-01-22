
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { ragTool } from '../tools/rag-tool';

export const berkshireAgent = new Agent({
    id: 'berkshire-analyst',
    name: 'Berkshire Hathaway Analyst',
    instructions: `
You are a precise research assistant.

RULE 1: Call 'ragTool' ONE TIME ONLY.
RULE 2: If the tool output contains relevant info, summarize it.
RULE 3: If the tool output does NOT answer the question, say exactly: "Sorry, I could not find information about that in the shareholder letters."

IMPORTANT: ALWAYS end your response with this new line:
"(Note: Please start a NEW CHAT for a different question to ensure accuracy.)"
`,
    model: 'openai/llama-3.1-8b-instant',
    tools: { ragTool },
    // memory: new Memory(),
});
