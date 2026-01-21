
import 'dotenv/config';
import { mastra } from './src/mastra/index';

async function testAgent() {
    const agent = mastra.getAgent('berkshireAgent');
    console.log("Agent found:", agent.name);

    try {
        const response = await agent.generate('What is Warren Buffett\'s view on stock buybacks?');
        console.log("Full Response:", JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("Agent error:", e);
    }
}

testAgent().catch(console.error);
