import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Program from './pages/Program'
import SessionLog from './pages/SessionLog'
import Knowledge from './pages/Knowledge'
import ClientPrograms from './pages/ClientPrograms'
import './App.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-text">Mun-Gut</span>
        <span className="brand-sub">मनगट</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Program
        </NavLink>
        <NavLink to="/log" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Session Log
        </NavLink>
        <NavLink to="/knowledge" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Knowledge
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Client Programs
        </NavLink>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
