
import { berkshireAgent } from '../../../../../mastra/agents/berkshire-agent';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = body.messages || [];
        const lastMessage = messages[messages.length - 1]?.content;

        if (!lastMessage) {
            return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
        }

        // Call Mastra Agent
        const result = await berkshireAgent.generate(lastMessage);

        return new Response(JSON.stringify({ text: result.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Agent Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
