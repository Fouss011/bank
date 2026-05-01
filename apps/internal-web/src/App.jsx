import { useEffect, useState } from 'react'
import {
  Bot,
  Building2,
  FileText,
  LogOut,
  Send,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react'
import './App.css'

const API_URL = 'https://backend-dry-grove-3348.fly.dev/api'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('banque_ia_token') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('chat')
  const [loading, setLoading] = useState(false)

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])
  const [users, setUsers] = useState([])
  const [documentsScope, setDocumentsScope] = useState('internal')

  const [docForm, setDocForm] = useState({
    title: '',
    description: '',
    category: '',
    scope: 'internal',
    min_access_level: 'P1',
    status: 'published',
    source_text: ''
  })

  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
    access_level: 'P1',
    department: ''
  })

  const canManage =
    user?.role === 'bank_admin' || user?.role === 'super_admin'

  useEffect(() => {
    if (!token) return

    async function loadCurrentUser() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()

        if (!data.success) {
          logout()
          return
        }

        setUser(data.data.user)
      } catch {
        logout()
      }
    }

    loadCurrentUser()
  }, [token])

  function logout() {
    localStorage.removeItem('banque_ia_token')
    setToken('')
    setUser(null)
    setMessages([])
    setDocuments([])
    setUsers([])
    setActivePage('chat')
  }

  async function login(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'Erreur de connexion')
        return
      }

      localStorage.setItem('banque_ia_token', data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
    } catch {
      alert('Impossible de contacter le backend')
    } finally {
      setLoading(false)
    }
  }

  async function askCopilot(e) {
    e.preventDefault()
    if (!question.trim()) return

    const currentQuestion = question
    setMessages((prev) => [...prev, { role: 'user', content: currentQuestion }])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/internal-chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
        {
          role: 'assistant',
          content: 'Impossible de contacter le service pour le moment.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function loadDocuments(scope = documentsScope) {
  setLoading(true)

  try {
    const res = await fetch(`${API_URL}/documents?scope=${scope}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.message || 'Impossible de charger les documents')
      return
    }

    setDocuments(data.data.documents || [])
  } catch {
    alert('Erreur chargement documents')
  } finally {
    setLoading(false)
  }
}

  async function createDocument(e) {
    e.preventDefault()

    if (!docForm.title.trim() || !docForm.source_text.trim()) {
      alert('Titre et contenu obligatoires')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(docForm)
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'Erreur création document')
        return
      }

      alert(`Document créé avec ${data.data.chunks_created} segment(s)`)

      setDocForm({
        title: '',
        description: '',
        category: '',
        scope: 'internal',
        min_access_level: 'P1',
        status: 'published',
        source_text: ''
      })

      loadDocuments()
    } catch {
      alert('Impossible de créer le document')
    } finally {
      setLoading(false)
    }
  }

  async function deleteDoc(id) {
    if (!confirm('Supprimer ce document ?')) return

    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'Suppression impossible')
        return
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch {
      alert('Erreur suppression document')
    }
  }

  async function loadUsers() {
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'Erreur chargement utilisateurs')
        return
      }

      setUsers(data.data.users || [])
    } catch {
      alert('Erreur chargement utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e) {
    e.preventDefault()

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'Erreur création utilisateur')
        return
      }

      alert('Utilisateur créé')

      setNewUser({
        full_name: '',
        email: '',
        password: '',
        role: 'employee',
        access_level: 'P1',
        department: ''
      })

      loadUsers()
    } catch {
      alert('Erreur création utilisateur')
    }
  }

  async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'Suppression impossible')
        return
      }

      loadUsers()
    } catch {
      alert('Erreur suppression utilisateur')
    }
  }

  if (!token) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-brand">
            <div className="brand-mark">
              <Building2 size={30} />
            </div>
            <div>
              <h1>Banque IA</h1>
              <p>Portail sécurisé d’information interne</p>
            </div>
          </div>

          <form onSubmit={login} className="login-form">
            <div>
              <label>Adresse email</label>
              <input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="votre.email@banque.com"
/>
            </div>

            <div>
              <label>Mot de passe</label>
              <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Votre mot de passe"
/>
            </div>

            <button disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">
            <Building2 size={24} />
          </div>
          <div>
            <h1>Banque IA</h1>
            <p>Portail interne</p>
          </div>
        </div>

        <nav className="nav">
          <button
            className={activePage === 'chat' ? 'active' : ''}
            onClick={() => setActivePage('chat')}
          >
            <Bot size={18} />
            Assistant interne
          </button>

          {canManage && (
            <>
              <button
                className={activePage === 'documents' ? 'active' : ''}
                onClick={() => setActivePage('documents')}
              >
                <FileText size={18} />
                Base documentaire
              </button>

              <button
                className={activePage === 'users' ? 'active' : ''}
                onClick={() => setActivePage('users')}
              >
                <Users size={18} />
                Utilisateurs
              </button>
            </>
          )}
        </nav>

        <div className="user-box">
          <p>Utilisateur connecté</p>
          <strong>{user?.full_name || 'Admin Demo'}</strong>
          <span>
            {user?.role || 'bank_admin'} · Niveau {user?.access_level || 'P3'}
          </span>
        </div>

        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      {activePage === 'chat' && (
        <section className="main-panel">
          <header className="page-header">
            <div>
              <p className="eyebrow">Service interne sécurisé</p>
              <h2>Assistant documentaire</h2>
              <span>
                Les réponses sont générées uniquement à partir des documents autorisés.
              </span>
            </div>

            <div className="security-badge">
              <ShieldCheck size={18} />
              Accès contrôlé
            </div>
          </header>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Bot size={28} />
                </div>
                <h3>Rechercher une information interne</h3>
                <p>
                  Posez une question sur les procédures, documents ou informations
                  disponibles selon votre niveau d’accès.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <p>{msg.content}</p>

                {msg.citations?.length > 0 && (
                  <div className="citations">
                    <strong>Sources utilisées</strong>
                    {msg.citations.map((c, i) => (
                      <span key={i}>{c.document_title}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                Traitement de la demande en cours...
              </div>
            )}
          </div>

          <form className="ask-form" onSubmit={askCopilot}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Saisissez votre question..."
            />
            <button disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      {activePage === 'documents' && canManage && (
        <section className="main-panel documents-page">
          <header className="page-header">
            <div>
              <p className="eyebrow">Administration documentaire</p>
              <h2>Base documentaire</h2>
              <span>
                Ajoutez les contenus validés qui alimentent l’assistant selon les droits.
              </span>
            </div>

            <div className="security-badge">
              <FileText size={18} />
              Documents validés
            </div>
          </header>

          <section className="documents-list-box">
            <div className="section-header">
              <div>
                <h3>
  Documents {documentsScope === 'external' ? 'externes' : 'internes'}
</h3>
<p>
  Liste des documents {documentsScope === 'external' ? 'externes' : 'internes'} publiés.
</p>
              </div>

              <div className="scope-actions">
  <button
    type="button"
    onClick={() => {
      setDocumentsScope('internal')
      loadDocuments('internal')
    }}
  >
    Voir internes
  </button>

  <button
    type="button"
    onClick={() => {
      setDocumentsScope('external')
      loadDocuments('external')
    }}
  >
    Voir externes
  </button>
</div>
            </div>

            {documents.length === 0 ? (
              <p className="muted">Aucun document chargé pour le moment.</p>
            ) : (
              <div className="documents-list">
                {documents.map((doc) => (
                  <article key={doc.id} className="document-item">
                    <div>
                      <h4>{doc.title}</h4>
                      <p>{doc.description || 'Sans description'}</p>
                      <span>
                        {doc.scope} · {doc.min_access_level} ·{' '}
                        {doc.category || 'Sans catégorie'}
                      </span>
                    </div>

                    <button type="button" onClick={() => deleteDoc(doc.id)}>
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <form className="document-form" onSubmit={createDocument}>
            <div className="section-header">
              <div>
                <h3>Ajouter un document</h3>
                <p>
                  Les documents externes alimenteront le futur portail client.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <label>Titre</label>
                <input
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Ex : Procédure interne RH"
                />
              </div>

              <div>
                <label>Catégorie</label>
                <input
                  value={docForm.category}
                  onChange={(e) =>
                    setDocForm({ ...docForm, category: e.target.value })
                  }
                  placeholder="Ex : RH, conformité, crédit..."
                />
              </div>

              <div>
                <label>Portée</label>
                <select
                  value={docForm.scope}
                  onChange={(e) => setDocForm({ ...docForm, scope: e.target.value })}
                >
                  <option value="internal">Interne</option>
                  <option value="external">Externe</option>
                </select>
              </div>

              <div>
                <label>Niveau minimum</label>
                <select
                  value={docForm.min_access_level}
                  onChange={(e) =>
                    setDocForm({ ...docForm, min_access_level: e.target.value })
                  }
                >
                  <option value="P1">P1 - Général</option>
                  <option value="P2">P2 - Intermédiaire</option>
                  <option value="P3">P3 - Sensible</option>
                </select>
              </div>
            </div>

            <div>
              <label>Description</label>
              <input
                value={docForm.description}
                onChange={(e) =>
                  setDocForm({ ...docForm, description: e.target.value })
                }
                placeholder="Courte description du document"
              />
            </div>

            <div>
              <label>Contenu validé</label>
              <textarea
                value={docForm.source_text}
                onChange={(e) =>
                  setDocForm({ ...docForm, source_text: e.target.value })
                }
                placeholder="Collez ici le contenu documentaire validé..."
              />
            </div>

            <button className="primary-action" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Publier le document'}
            </button>
          </form>
        </section>
      )}

      {activePage === 'users' && canManage && (
        <section className="main-panel documents-page">
          <header className="page-header">
            <div>
              <p className="eyebrow">Administration</p>
              <h2>Gestion des utilisateurs</h2>
              <span>Créer et gérer les accès internes de la banque.</span>
            </div>

            <div className="security-badge">
              <Users size={18} />
              Accès utilisateurs
            </div>
          </header>

          <section className="documents-list-box">
            <div className="section-header">
              <div>
                <h3>Utilisateurs</h3>
                <p>Liste des comptes liés à la banque.</p>
              </div>

              <button type="button" onClick={loadUsers}>
                Charger
              </button>
            </div>

            {users.length === 0 ? (
              <p className="muted">Aucun utilisateur chargé pour le moment.</p>
            ) : (
              <div className="documents-list">
                {users.map((u) => (
                  <article key={u.id} className="document-item">
                    <div>
                      <h4>{u.full_name}</h4>
                      <p>{u.email}</p>
                      <span>
                        {u.role} · {u.access_level} · {u.department || '—'}
                      </span>
                    </div>

                    <button type="button" onClick={() => deleteUser(u.id)}>
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <form className="document-form" onSubmit={createUser}>
            <div className="section-header">
              <div>
                <h3>Créer un utilisateur</h3>
                <p>Attribuez un rôle et un niveau d’accès documentaire.</p>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <label>Nom complet</label>
                <input
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Département</label>
                <input
                  value={newUser.department}
                  onChange={(e) =>
                    setNewUser({ ...newUser, department: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="employee">Employé</option>
                  <option value="bank_admin">Admin banque</option>
                </select>
              </div>

              <div>
                <label>Niveau</label>
                <select
                  value={newUser.access_level}
                  onChange={(e) =>
                    setNewUser({ ...newUser, access_level: e.target.value })
                  }
                >
                  <option value="P1">P1 - Général</option>
                  <option value="P2">P2 - Intermédiaire</option>
                  <option value="P3">P3 - Sensible</option>
                </select>
              </div>
            </div>

            <button className="primary-action" disabled={loading}>
              Créer l’utilisateur
            </button>
          </form>
        </section>
      )}
    </main>
  )
}