"use client";

import { useState } from 'react';

export default function Home() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hello! I am the Berkshire Hathaway Analyst. Ask me about Warren Buffett's letters (2019-2023)." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user' as const, content: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/agents/berkshire-analyst/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: input }] })
            });

            const data = await response.json();

            if (data && data.text) {
                setMessages([...newMessages, { role: 'ai', content: data.text }]);
            } else {
                setMessages([...newMessages, { role: 'ai', content: "Sorry, I encountered an error." }]);
            }
        } catch (e) {
            setMessages([...newMessages, { role: 'ai', content: "Error connecting to server." }]);
        }
        setLoading(false);
    };

    const startNewChat = () => {
        setMessages([{ role: 'ai', content: "Memory cleared. Ready for a new topic!" }]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f1117', color: 'white', fontFamily: 'sans-serif' }}>

            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.2rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Berkshire Intelligence
                </h1>
                <button onClick={startNewChat} style={{ background: '#374151', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                    + New Chat
                </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: '10px' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.role === 'user' ? '#6366f1' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {m.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div style={{ background: m.role === 'user' ? '#4f46e5' : '#1f2937', padding: '12px', borderRadius: '12px', maxWidth: '75%', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && <div style={{ color: '#9ca3af', textAlign: 'center' }}>Thinking...</div>}
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', borderTop: '1px solid #1f2937', display: 'flex', gap: '10px' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about Apple, Buybacks, or Geico..."
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }}
                />
                <button onClick={sendMessage} disabled={loading} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' }}>
                    Send
                </button>
            </div>
            <div style={{ textAlign: 'center', paddingBottom: '10px', fontSize: '0.8rem', color: '#6b7280' }}>
                Start a New Chat for each distinct query to ensure accuracy.
            </div>
        </div>
    );
}
