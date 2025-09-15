import React, { useState } from 'react';


const FloatingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((msgs) => [
      ...msgs,
      { from: 'user', text: trimmed },
      { from: 'bot', text: 'Chatbot under development.' }
    ]);
    setInput('');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}>
      {open && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          padding: 0,
          minWidth: 300,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 400,
        }}>
          <div style={{ fontWeight: 600, padding: '16px 20px 8px 20px', borderBottom: '1px solid #000000ff', color: 'blue' }}>TrackIt Chatbot</div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 20px',
            minHeight: 120,
            maxHeight: 220,
            background: '#f9fafb',
            fontSize: 15,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 8,
                textAlign: msg.from === 'user' ? 'right' : 'left',
              }}>
                <span style={{
                  display: 'inline-block',
                  background: msg.from === 'user' ? '#2563eb' : '#e5e7eb',
                  color: msg.from === 'user' ? 'white' : '#222',
                  borderRadius: 8,
                  padding: '6px 12px',
                  maxWidth: 200,
                  wordBreak: 'break-word',
                }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} style={{
            display: 'flex',
            borderTop: '1px solid #eee',
            padding: '10px 12px',
            background: 'white',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                border: '1px solid #425272ff',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 15,
                outline: 'none',
                marginRight: 8,
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
            />
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                color: '#888',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                marginLeft: 4,
                cursor: 'pointer',
                fontSize: 18,
              }}
              title="Close"
            >
              ×
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          fontSize: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Open chatbot"
      >
        🤖
      </button>
    </div>
  );
};

export default FloatingChatbot;
