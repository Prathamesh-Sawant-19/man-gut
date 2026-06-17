import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const DAY_TYPES = [
  { value: 'day1', label: 'Day 1 — Chest + Triceps' },
  { value: 'day2', label: 'Day 2 — Back + Biceps' },
  { value: 'day3', label: 'Day 3 — Shoulders + Abs' },
  { value: 'day4', label: 'Day 4 — Legs' },
  { value: 'day5', label: 'Day 5 — Cardio' },
]

const today = new Date().toISOString().split('T')[0]

export default function SessionLog() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    day_type: 'day1',
    date: today,
    duration_minutes: '',
    notes: '',
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      setError('Could not load sessions.')
    } else {
      setSessions(data)
    }
    setLoading(false)
  }

  async function saveSession() {
    if (!form.date || !form.day_type) return
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('sessions').insert([{
      day_type: form.day_type,
      date: form.date,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
      notes: form.notes || null,
    }])

    if (error) {
      setError('Failed to save session. Try again.')
    } else {
      setSuccess(true)
      setForm({ day_type: 'day1', date: today, duration_minutes: '', notes: '' })
      setShowForm(false)
      fetchSessions()
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  async function deleteSession(id) {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) fetchSessions()
  }

  function getDayLabel(value) {
    return DAY_TYPES.find(d => d.value === value)?.label || value
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const dayColors = {
    day1: '#ef4444', day2: '#3b82f6', day3: '#8b5cf6',
    day4: '#10b981', day5: '#f59e0b'
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Session Log</h1>
          <p className="page-subtitle">Track every session. Watch the consistency build.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Log Session'}
        </button>
      </div>

      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#16a34a'
        }}>
          ✅ Session saved successfully.
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>New Session</h2>

          <div className="form-group">
            <label className="form-label">Day Type</label>
            <select
              className="form-input"
              value={form.day_type}
              onChange={e => setForm({ ...form, day_type: e.target.value })}
            >
              {DAY_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 70"
                value={form.duration_minutes}
                onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Session Notes</label>
            <textarea
              className="form-input form-textarea"
              placeholder="How did it feel? PRs hit? Energy levels? Any language works — English, Marathi, Munglish..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveSession}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
            Loading sessions...
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏋️</div>
            <p className="empty-state-text">No sessions logged yet</p>
            <p className="empty-state-sub">Hit "+ Log Session" after every workout to start tracking</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
          </div>
          {sessions.map(session => (
            <div key={session.id} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '4px', height: '40px', borderRadius: '2px',
                    background: dayColors[session.day_type] || '#6366f1', flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {getDayLabel(session.day_type)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatDate(session.date)}
                      {session.duration_minutes && ` · ${session.duration_minutes} min`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteSession(session.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '16px', padding: '4px'
                  }}
                  title="Delete session"
                >
                  ×
                </button>
              </div>
              {session.notes && (
                <div style={{
                  marginTop: '10px', marginLeft: '14px', fontSize: '13px',
                  color: 'var(--text-secondary)', lineHeight: '1.6',
                  borderTop: '1px solid var(--border)', paddingTop: '10px'
                }}>
                  {session.notes}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
