import { useEffect, useRef, useState } from 'react'
import { Building2, Send } from 'lucide-react'
import './App.css'

const API_URL = 'https://backend-dry-grove-3348.fly.dev/api'

export default function App() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

const scrollToBottom = () => {
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }, 100)
}

useEffect(() => {
  scrollToBottom()
}, [messages])
  const [loading, setLoading] = useState(false)

  async function ask(e) {
    e.preventDefault()
    if (!question.trim()) return

    const currentQuestion = question
    setMessages((prev) => [...prev, { role: 'user', content: currentQuestion }])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/external-chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion })
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
  role: 'assistant',
  content: data.success ? data.data.answer : data.message,
  citations: data.data?.citations || []
}
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Service momentanément indisponible.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function askQuick(text) {
  if (loading) return

  setMessages((prev) => [...prev, { role: 'user', content: text }])
  setLoading(true)

  try {
    const res = await fetch(`${API_URL}/external-chat/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text })
    })

    const data = await res.json()

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: data.success ? data.data.answer : data.message
      }
    ])
  } catch {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Service momentanément indisponible.' }
    ])
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="external-app">
      <header className="hero">
        <div className="brand">
          <div className="brand-icon">
  <img src="/logo-icon-512.png" alt="Logo" className="brand-logo" />
            
          </div>
          <div>
            <h1>Banque</h1>
            <p>Assistant d’information client</p>
          </div>
        </div>

        <div className="hero-content">
          <p className="eyebrow">Information bancaire</p>
          <h2>Préparez votre démarche avant de venir en agence</h2>
          <p>
            Posez une question sur l’ouverture de compte, les prêts ou les documents à fournir.
          </p>
        </div>
      </header>

      <section className="quick-actions">
  <button onClick={() => askQuick('Comment ouvrir un compte bancaire ?')}>
    Ouvrir un compte
  </button>

  <button onClick={() => askQuick('Comment demander un prêt ?')}>
    Demander un prêt
  </button>

  <button onClick={() => askQuick('Quels documents faut-il fournir ?')}>
    Documents à fournir
  </button>

  <button onClick={() => askQuick('Comment contacter un conseiller ?')}>
    Contacter un conseiller
  </button>
</section>

      <section className="chat-card">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty">
              <h3>Comment pouvons-nous vous aider ?</h3>
              <p>Exemple : Quels documents faut-il pour ouvrir un compte ?</p>
            </div>
          )}

          {messages.map((msg, index) => (
  <div key={index} className={`message ${msg.role}`}>
    <div className="message-text">{msg.content}</div>

    {msg.role === 'assistant' && msg.citations?.length > 0 && (
      <div className="sources">
        <strong>Informations issues des documents officiels</strong>

        {[...new Set(msg.citations.map((c) => c.document_title))]
          .filter(Boolean)
          .map((title, i) => (
            <span key={i}>• {title}</span>
          ))}
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
))}

          {loading && <div className="message assistant">Recherche en cours...</div>}
        </div>

        <form className="ask-form" onSubmit={ask}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question..."
          />
          <button disabled={loading}>
            <Send size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}