import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const DAY_COLORS = {
  day1: '#ef4444', day2: '#3b82f6', day3: '#8b5cf6',
  day4: '#10b981', day5: '#f59e0b'
}

export default function SessionLog() {
  const [view, setView] = useState('history') // history | log
  const [programs, setPrograms] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Active session state
  const [selectedDay, setSelectedDay] = useState('day1')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [exerciseSets, setExerciseSets] = useState({}) // { exerciseName: [{weight, reps}] }

  useEffect(() => {
    fetchPrograms()
    fetchSessions()
  }, [])

  async function fetchPrograms() {
    const { data } = await supabase.from('programs').select('*').order('day_type')
    if (data) setPrograms(data)
  }

  async function fetchSessions() {
    setLoading(true)
    const { data } = await supabase.from('sessions').select('*').order('created_at', { ascending: false })
    if (data) setSessions(data)
    setLoading(false)
  }

  const currentProgram = programs.find(p => p.day_type === selectedDay)

  function initExercises(program) {
    if (!program) return
    const init = {}
    program.exercises.forEach(ex => { init[ex] = [{ weight: '', reps: '' }] })
    setExerciseSets(init)
  }

  useEffect(() => {
    if (currentProgram) initExercises(currentProgram)
  }, [selectedDay, programs])

  function addSet(exercise) {
    setExerciseSets(prev => ({
      ...prev,
      [exercise]: [...(prev[exercise] || []), { weight: '', reps: '' }]
    }))
  }

  function removeSet(exercise, idx) {
    setExerciseSets(prev => {
      const sets = [...(prev[exercise] || [])]
      if (sets.length <= 1) return prev
      sets.splice(idx, 1)
      return { ...prev, [exercise]: sets }
    })
  }

  function updateSet(exercise, idx, field, value) {
    setExerciseSets(prev => {
      const sets = [...(prev[exercise] || [])]
      sets[idx] = { ...sets[idx], [field]: value }
      return { ...prev, [exercise]: sets }
    })
  }

  async function saveSession() {
    setSaving(true)
    // Insert session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        day_type: selectedDay,
        date: sessionDate,
        duration_minutes: duration ? parseInt(duration) : null,
        notes: sessionNotes || null,
      }])
      .select()

    if (sessionError || !sessionData?.[0]) {
      setSaving(false)
      alert('Failed to save session')
      return
    }

    const sessionId = sessionData[0].id

    // Insert all sets
    const setsToInsert = []
    Object.entries(exerciseSets).forEach(([exercise, sets]) => {
      sets.forEach((set, idx) => {
        if (set.weight || set.reps) {
          setsToInsert.push({
            session_id: sessionId,
            exercise_name: exercise,
            set_number: idx + 1,
            weight_kg: set.weight ? parseFloat(set.weight) : null,
            reps: set.reps ? parseInt(set.reps) : null,
          })
        }
      })
    })

    if (setsToInsert.length > 0) {
      await supabase.from('session_sets').insert(setsToInsert)
    }

    setSuccess(true)
    setView('history')
    fetchSessions()
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  function getDayName(dayType) {
    const p = programs.find(p => p.day_type === dayType)
    return p ? `Day ${dayType.replace('day','')} — ${p.day_name}` : dayType
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
      weekday: 'short', day: 'numeric', month: 'short'
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Session Log</h1>
          <p className="page-subtitle">Track every set. Watch the progress compound.</p>
        </div>
        <button
          className={`btn ${view === 'log' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setView(view === 'log' ? 'history' : 'log')}
        >
          {view === 'log' ? 'Cancel' : '+ Log Session'}
        </button>
      </div>

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#16a34a' }}>
          ✅ Session saved successfully.
        </div>
      )}

      {/* LOG SESSION VIEW */}
      {view === 'log' && (
        <div>
          {/* Day selector */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Day</label>
              <select className="form-input" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                {programs.map(p => (
                  <option key={p.day_type} value={p.day_type}>Day {p.day_type.replace('day','')} — {p.day_name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Duration (min)</label>
                <input type="number" className="form-input" placeholder="e.g. 70" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Exercises */}
          {currentProgram?.exercises.map(exercise => (
            <div key={exercise} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                {exercise}
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>{exerciseSets[exercise]?.length || 0} sets</span>
              </div>

              {/* Set headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: '6px', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SET</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>KG</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>REPS</div>
                <div />
              </div>

              {/* Sets */}
              {(exerciseSets[exercise] || []).map((set, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: DAY_COLORS[selectedDay], textAlign: 'center' }}>{idx + 1}</div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={set.weight}
                    onChange={e => updateSet(exercise, idx, 'weight', e.target.value)}
                    style={{ padding: '8px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={set.reps}
                    onChange={e => updateSet(exercise, idx, 'reps', e.target.value)}
                    style={{ padding: '8px', textAlign: 'center' }}
                  />
                  <button onClick={() => removeSet(exercise, idx)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '16px', padding: '4px'
                  }}>×</button>
                </div>
              ))}

              <button onClick={() => addSet(exercise)} style={{
                background: 'none', border: '1px dashed var(--border)', borderRadius: '6px',
                width: '100%', padding: '6px', cursor: 'pointer', fontSize: '12px',
                color: 'var(--text-muted)', marginTop: '4px'
              }}>+ Add Set</button>
            </div>
          ))}

          {/* Notes */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <label className="form-label">Session Notes (optional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="How did it feel? PRs? Energy? Any language..."
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              style={{ minHeight: '80px' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveSession}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <>
          {loading ? (
            <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '14px' }}>Loading...</p></div>
          ) : sessions.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🏋️</div>
                <p className="empty-state-text">No sessions yet</p>
                <p className="empty-state-sub">Hit "+ Log Session" after every workout</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
              </div>
              {sessions.map(session => (
                <div key={session.id || session.date} className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: DAY_COLORS[session.day_type] || '#6366f1', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{getDayName(session.day_type)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatDate(session.date)}{session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
                      </div>
                    </div>
                  </div>
                  {session.notes && (
                    <div style={{ marginTop: '10px', marginLeft: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      {session.notes}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
