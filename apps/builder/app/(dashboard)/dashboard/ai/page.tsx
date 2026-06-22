'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Sparkles, Check, RefreshCw, Smartphone, Monitor, ChevronDown, Loader2, ExternalLink } from 'lucide-react'

interface Step {
  text: string
  done: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  steps?: string[]
  actions?: string[]
}

const STORAGE_KEY = 'nudge_ai_messages'

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
  "Generate a beautiful testimonials section with customer reviews",
  "Add a newsletter signup section with email input",
  "Create a features grid section showing 3 key benefits",
  "Build a FAQ accordion section",
  "Generate a trust badges / footer section",
  "Add a promotional banner section with CTA button",
]

function TypingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const iRef = useRef(0)

  useEffect(() => {
    iRef.current = 0
    setDisplayed('')
    setDone(false)
    const interval = setInterval(() => {
      iRef.current++
      setDisplayed(text.slice(0, iRef.current))
      if (iRef.current >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayed}{!done && <span className="animate-pulse">|</span>}</span>
}

function StepList({ steps, onComplete }: { steps: string[]; onComplete: () => void }) {
  const [visible, setVisible] = useState<boolean[]>(new Array(steps.length).fill(false))

  useEffect(() => {
    setVisible(new Array(steps.length).fill(false))
    steps.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev]
          next[i] = true
          if (i === steps.length - 1) {
            setTimeout(onComplete, 600)
          }
          return next
        })
      }, i * 800 + 300)
    })
  }, [steps.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-3 space-y-1.5">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 text-xs transition-all duration-500 ${
            visible[i] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          {visible[i] ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
              <Check size={10} className="text-green-600" />
            </span>
          ) : (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
              <Loader2 size={10} className="animate-spin text-gray-400" />
            </span>
          )}
          <span className={`${visible[i] ? 'text-green-700' : 'text-gray-400'}`}>{step}</span>
        </div>
      ))}
    </div>
  )
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stepsDone, setStepsDone] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const [storeName, setStoreName] = useState('')
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMessages(loadMessages())
  }, [])

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    fetch('/api/stores/list')
      .then((r) => r.json())
      .then((data) => {
        if (data.stores?.[0]) {
          setStoreId(data.stores[0].id)
          setStoreSlug(data.stores[0].slug)
          setStoreName(data.stores[0].name)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function refreshPreview() {
    setRefreshKey((k) => k + 1)
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return
    setStepsDone(false)

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
        steps: data.steps || [],
        actions: data.actions || [],
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleStepsComplete() {
    setStepsDone(true)
    refreshPreview()
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

  const lastMessage = messages[messages.length - 1]
  const showSteps = lastMessage?.role === 'assistant' && lastMessage.steps && lastMessage.steps.length > 0 && !stepsDone

  const chatPanel = (
    <div className="flex h-full flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F3F0] mb-6">
                <Sparkles size={32} className="text-[#0F0F0E]" />
              </div>
              <h2 className="text-xl font-bold text-[#0F0F0E] mb-2">What do you want to build?</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Ask me to change your store's look, add products, update settings, or anything else.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border bg-white px-4 py-2 text-sm text-muted-foreground hover:border-[#0F0F0E] hover:text-[#0F0F0E] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 px-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3F0]">
                      <Bot size={16} className="text-[#0F0F0E]" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0F0F0E] text-white rounded-tr-md'
                          : 'bg-[#F4F3F0] text-[#0F0F0E] rounded-tl-md'
                      }`}
                    >
                      {msg.role === 'assistant' && i === messages.length - 1 && msg.content === messages[messages.length - 1].content && !loading ? (
                        <TypingText text={msg.content} speed={15} />
                      ) : (
                        msg.content
                      )}
                    </div>

                    {msg.role === 'assistant' && msg.steps && msg.steps.length > 0 && i === messages.length - 1 && !stepsDone && (
                      <StepList steps={msg.steps} onComplete={handleStepsComplete} />
                    )}

                    {msg.role === 'assistant' && msg.steps && msg.steps.length > 0 && stepsDone && (
                      <div className="mt-2 space-y-1">
                        {msg.steps.map((step, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-green-700">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                              <Check size={10} className="text-green-600" />
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && stepsDone && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.actions.map((a, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-medium text-green-700"
                          >
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

              {loading && !showSteps && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3F0]">
                    <Bot size={16} className="text-[#0F0F0E]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-[#F4F3F0] px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              className="w-full resize-none rounded-xl border bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#0F0F0E] transition-colors"
              disabled={loading}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F0F0E] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
        {messages.length > 0 && (
          <div className="mx-auto max-w-2xl mt-2">
            <button onClick={clearChat} className="text-[11px] text-muted-foreground hover:text-[#0F0F0E] transition-colors">
              Clear conversation
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const previewPanel = (
    <div className="flex h-full flex-col bg-[#FAFAF8]">
      <div className="flex items-center justify-between border-b bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Live preview</span>
          {storeSlug && (
            <a
              href={`http://localhost:3001/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink size={12} />
              Open in new tab
            </a>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileView('chat')}
            className={`rounded-lg p-1.5 ${mobileView === 'chat' ? 'bg-[#F4F3F0]' : ''}`}
            title="Chat"
          >
            <Smartphone size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={refreshPreview}
            className="rounded-lg p-1.5 hover:bg-[#F4F3F0] transition-colors"
            title="Refresh preview"
          >
            <RefreshCw size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {storeSlug ? (
          <iframe
            key={refreshKey}
            src={`http://localhost:3001/${storeSlug}?t=${Date.now()}`}
            className="h-full w-full border-0"
            title="Store preview"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No store found
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F0F0E]">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold">AI Builder</h1>
            <p className="text-[11px] text-muted-foreground">{storeName || 'Loading...'}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${stepsDone ? 'bg-green-500' : loading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs text-muted-foreground">
            {loading ? 'Working...' : stepsDone ? 'Ready' : 'Idle'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden md:hidden">
        <div className="flex border-b bg-white">
          <button
            onClick={() => setMobileView('chat')}
            className={`flex-1 py-2.5 text-xs font-medium ${mobileView === 'chat' ? 'border-b-2 border-[#0F0F0E] text-[#0F0F0E]' : 'text-muted-foreground'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-2.5 text-xs font-medium ${mobileView === 'preview' ? 'border-b-2 border-[#0F0F0E] text-[#0F0F0E]' : 'text-muted-foreground'}`}
          >
            Preview
          </button>
        </div>
        {mobileView === 'chat' ? chatPanel : previewPanel}
      </div>

      <div className="hidden md:flex flex-1">
        <div className="w-[45%] border-r">{chatPanel}</div>
        <div className="flex-1">{previewPanel}</div>
      </div>
    </div>
  )
}
