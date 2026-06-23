import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Program from './pages/Program'
import SessionLog from './pages/SessionLog'
import Knowledge from './pages/Knowledge'
import ClientPrograms from './pages/ClientPrograms'
import Auth from './pages/Auth'
import './App.css'

function Navbar() {
  const { user, profile, signOut } = useAuth()

  const displayName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : user?.email?.split('@')[0] ?? ''

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-text">Mun-Gut</span>
        <span className="brand-sub">मनगट</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Program</NavLink>
        <NavLink to="/log" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Session Log</NavLink>
        <NavLink to="/knowledge" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Knowledge</NavLink>
        <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Clients</NavLink>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {displayName}
        </span>
        <button
          onClick={signOut}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

function AppShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>Mun-Gut</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="app">
      <Navbar />
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
