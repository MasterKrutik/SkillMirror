'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STARTER_CHIPS = [
  { label: '📄 Optimize ATS Resume', prompt: 'How do I format my resume to pass ATS scanners and highlight quantitative metrics?' },
  { label: '🎯 STAR Behavioral Prep', prompt: 'Give me a template and tips for answering behavioral questions using the STAR framework.' },
  { label: '⚡ System Design Architecture', prompt: 'What key components and trade-offs should I cover in a System Design interview?' },
  { label: '💻 Big-O & DSA Complexity', prompt: 'How do I analyze and explain time & space complexity out loud during a coding round?' }
];

export default function ChatbotWidget({ context = 'general' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am Sarthi, your official SkillMirror AI Assistant. Ask me how to optimize your resume, prepare for mock interviews, or master System Design & DSA!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Clean up streaming request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearHistory = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setError(null);
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared. How can I assist your career preparation today?'
      }
    ]);
  };

  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isStreaming) return;

    setError(null);
    setInput('');

    // Append user message to history
    const userMessage = { role: 'user', content: textToSend.trim() };
    const updatedHistory = [...messages, userMessage];
    
    // Add placeholder for streaming assistant response
    const assistantMessagePlaceholder = { role: 'assistant', content: '' };
    setMessages([...updatedHistory, assistantMessagePlaceholder]);
    setIsStreaming(true);

    // Prepare stateless client-owned history payload (excluding initial system welcome)
    const clientHistory = updatedHistory
      .filter((m, idx) => idx > 0)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: clientHistory,
          context: context
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Stream request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Response body readable stream unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Process complete SSE data lines
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.replace('data: ', '').trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.done) {
                setIsStreaming(false);
                break;
              }

              if (data.token) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIdx = newMsgs.length - 1;
                  if (lastIdx >= 0 && newMsgs[lastIdx].role === 'assistant') {
                    newMsgs[lastIdx] = {
                      ...newMsgs[lastIdx],
                      content: newMsgs[lastIdx].content + data.token
                    };
                  }
                  return newMsgs;
                });
              }
            } catch (err) {
              console.warn('SSE JSON parse error:', err, jsonStr);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chatbot stream error:', err);
        setError(err.message || 'Unable to connect to the streaming assistant. Please try again.');
        
        // Remove empty placeholder if streaming failed before receiving tokens
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#4A5B8C] text-white flex items-center justify-center shadow-2xl hover:bg-[#3b4970] transition-colors border-2 border-white/40 focus:outline-none"
        aria-label="Toggle SkillMirror AI Assistant"
      >
        <span className="text-2xl">{isOpen ? '✕' : '💬'}</span>
      </motion.button>

      {/* Floating Chat Widget Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 md:w-[420px] bg-[#FBF7F0] rounded-2xl border border-indigo-900/15 shadow-2xl overflow-hidden flex flex-col max-h-[620px] h-[540px]"
          >
            {/* Header Bar */}
            <div className="bg-[#4A5B8C] p-4 text-white flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold border border-white/20">
                  ⚡
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base leading-tight">Sarthi AI Assistant</h3>
                  <span className="text-[10px] text-indigo-100/90 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#8BA888] animate-pulse"></span>
                    Real-time SSE Stream · google-genai
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear chat history"
                  className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white text-base font-bold px-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-900 flex items-start gap-2 shrink-0">
                <span className="font-bold">⚠️</span>
                <span className="flex-1 leading-relaxed">{error}</span>
                <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold">✕</button>
              </div>
            )}

            {/* Messages Body Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBF7F0]">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-2xs ${
                      m.role === 'user'
                        ? 'bg-[#4A5B8C] text-white rounded-br-none font-medium'
                        : 'bg-white border border-indigo-900/10 text-[#2E2A26] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-white border border-indigo-900/10 px-3.5 py-2 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-[#4A5B8C]">Streaming token response</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#D9A441] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#D9A441] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#D9A441] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Starter Suggestion Chips (Shown when messages count is low) */}
            {messages.length <= 2 && !isStreaming && (
              <div className="px-4 py-2 bg-white/70 border-t border-slate-200/80 flex flex-wrap gap-1.5 shrink-0">
                {STARTER_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.prompt)}
                    className="text-[11px] font-semibold text-[#4A5B8C] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1 rounded-full text-left transition-colors truncate max-w-full"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question about your resume, interview prep, or code..."
                  disabled={isStreaming}
                  className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#4A5B8C] bg-white placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-xs ${
                    isStreaming || !input.trim()
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-[#4A5B8C] hover:bg-[#3b4970] active:scale-95'
                  }`}
                >
                  {isStreaming ? '...' : 'Send'}
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
