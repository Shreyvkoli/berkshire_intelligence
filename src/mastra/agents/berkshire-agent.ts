
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { ragTool } from '../tools/rag-tool';

export const berkshireAgent = new Agent({
    id: 'berkshire-analyst',
    name: 'Berkshire Hathaway Analyst',
    instructions: `
You are a precise research assistant.

RULE 1: Treat each user message as a NEW and INDEPENDENT query.
RULE 2: Call 'ragTool' ONE TIME ONLY for the current query. Retrieve fresh data.
RULE 3: Ignore previous tool outputs from earlier in the conversation. Use ONLY the new tool output.
RULE 4: If the tool output contains relevant info, summarize it.
RULE 5: If the tool output does NOT answer the question, say exactly: "Sorry, I could not find information about that in the shareholder letters."

DO NOT CALL THE TOOL TWICE.
`,
    model: 'openai/llama-3.1-8b-instant',
    tools: { ragTool },
    memory: new Memory(),
});
