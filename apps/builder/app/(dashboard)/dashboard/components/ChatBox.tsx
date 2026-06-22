'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: string[]
}

const STORAGE_KEY = 'nudge_chat_messages'

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
  } catch {}
}

const suggestions = [
  "Add rounded corners to product cards",
  "Change background to light pink",
  "Make header sticky with blur",
  "Add a new product for ₹199",
  "Add CSS gradient to hero section",
]

export default function ChatBox({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages(loadMessages())
  }, [])

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return

    const userMsg: Message = { role: 'user', content: content.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, message: content.trim() }),
      })
      const data = await res.json()

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Sorry, I could not process that.',
        actions: data.actions || [],
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearChat() {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20 md:bg-transparent md:pointer-events-none" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          open
            ? 'h-[600px] w-full max-w-[420px] rounded-t-2xl border md:bottom-6 md:right-6 md:rounded-2xl md:shadow-2xl'
            : 'h-0 w-0 overflow-hidden'
        }`}
      >
        {open && (
          <>
            <div className="flex items-center justify-between border-b bg-[#0F0F0E] px-5 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Nudge AI</p>
                  <p className="text-[10px] text-white/60">Store assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F3F0] mb-4">
                    <Sparkles size={24} className="text-[#0F0F0E]" />
                  </div>
                  <p className="text-sm font-medium text-[#0F0F0E] mb-1">Ask me anything about your store</p>
                  <p className="text-xs text-muted-foreground mb-6">I can update your theme, add products, change settings, and more.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="rounded-full border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:border-[#0F0F0E] hover:text-[#0F0F0E] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3F0]">
                      <Bot size={16} className="text-[#0F0F0E]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0F0F0E] text-white rounded-tr-md'
                          : 'bg-[#F4F3F0] text-[#0F0F0E] rounded-tl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {msg.actions.map((a, j) => (
                          <span key={j} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-medium text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F0F0E]">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3F0]">
                    <Bot size={16} className="text-[#0F0F0E]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-[#F4F3F0] px-4 py-3">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl border bg-[#FAFAF8] px-4 py-2.5 text-sm outline-none focus:border-[#0F0F0E] transition-colors"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F0F0E] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
              {messages.length > 0 && (
                <button onClick={clearChat} className="mt-2 text-[10px] text-muted-foreground hover:text-[#0F0F0E] transition-colors">
                  Clear conversation
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F0F0E] text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${
          open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <MessageSquare size={22} />
      </button>
    </>
  )
}
