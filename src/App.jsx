import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Program from './pages/Program'
import SessionLog from './pages/SessionLog'
import Knowledge from './pages/Knowledge'
import ClientPrograms from './pages/ClientPrograms'
import Auth from './pages/Auth'
import './App.css'

/* ── Custom SVG icons ── */
const IconTraining = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <line x1="4" y1="8" x2="12" y2="8"/>
    <line x1="5.5" y1="5.5" x2="5.5" y2="10.5" strokeWidth="2.2"/>
    <line x1="10.5" y1="5.5" x2="10.5" y2="10.5" strokeWidth="2.2"/>
    <line x1="3.5" y1="6.2" x2="3.5" y2="9.8" strokeWidth="1.4"/>
    <line x1="12.5" y1="6.2" x2="12.5" y2="9.8" strokeWidth="1.4"/>
  </svg>
)

const IconLogbook = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 13V4.5C8 4.5 6.5 3.5 3.5 3.5V12C3.5 12 5.5 12 8 13Z"/>
    <path d="M8 13V4.5C8 4.5 9.5 3.5 12.5 3.5V12C12.5 12 10.5 12 8 13Z"/>
  </svg>
)

const IconLibrary = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="3" y1="5" x2="13" y2="5"/>
    <line x1="3" y1="8" x2="13" y2="8"/>
    <line x1="3" y1="11" x2="10" y2="11"/>
  </svg>
)

const IconClients = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5.5" r="2"/>
    <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
    <circle cx="11.5" cy="5.5" r="1.5"/>
    <path d="M13.5 13c0-1.7-1-3-2.5-3.5"/>
  </svg>
)

function Sidebar({ theme, toggleTheme }) {
  const { user, profile, signOut } = useAuth()

  const displayName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : user?.email?.split('@')[0] ?? ''

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-text">Mun-Gut</span>
        <span className="brand-sub">मनगट</span>
      </div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon"><IconTraining /></span>
            Training
          </NavLink>
        </li>
        <li>
          <NavLink to="/log" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon"><IconLogbook /></span>
            Logbook
          </NavLink>
        </li>
        <li>
          <NavLink to="/knowledge" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon"><IconLibrary /></span>
            Library
          </NavLink>
        </li>
        <li>
          <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon"><IconClients /></span>
            Clients
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <span className="sidebar-user-name">{displayName}</span>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀ Light' : '● Dark'}
        </button>
        <button className="sign-out-btn" onClick={signOut}>Sign out</button>
      </div>
    </aside>
  )
}

function AppShell() {
  const { user, loading } = useAuth()

  // Theme — dark default, persisted
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mg-theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('mg-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>Mun-Gut</div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>Loading…</div>
        </div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="app">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Program />} />
          <Route path="/log" element={<SessionLog />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/clients" element={<ClientPrograms />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
