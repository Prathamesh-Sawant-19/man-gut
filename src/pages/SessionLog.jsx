import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

const DAY_COLORS = {
  day1: '#ef4444', day2: '#3b82f6', day3: '#8b5cf6',
  day4: '#10b981', day5: '#f59e0b'
}

// ─────────────────────────────────────────────
// History card — expandable to show sets
// ─────────────────────────────────────────────
function SessionCard({ session, getDayName, formatDate, onEdit, onDeleteRequest, deletingId, onDeleteConfirm, onDeleteCancel }) {
  const [expanded, setExpanded] = useState(false)
  const [sets, setSets] = useState(null) // null = not loaded yet
  const [loadingSets, setLoadingSets] = useState(false)

  async function toggleExpand() {
    if (!expanded && sets === null) {
      setLoadingSets(true)
      const { data } = await supabase
        .from('session_sets')
        .select('*')
        .eq('session_id', session.id)
        .order('exercise_name')
        .order('set_number')
      setSets(data || [])
      setLoadingSets(false)
    }
    setExpanded(prev => !prev)
  }

  // Group sets by exercise
  const byExercise = {}
  if (sets) {
    sets.forEach(row => {
      if (!byExercise[row.exercise_name]) byExercise[row.exercise_name] = []
      byExercise[row.exercise_name].push(row)
    })
  }

  const color = DAY_COLORS[session.day_type] || '#6366f1'

  return (
    <div className="card" style={{ marginBottom: '12px' }}>

      {/* Delete confirm banner */}
      {deletingId === session.id && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px',
          padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#dc2626',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
        }}>
          <span>Delete this session and all its sets?</span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => onDeleteConfirm(session.id)}
              style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >Delete</button>
            <button
              onClick={onDeleteCancel}
              style={{ padding: '4px 12px', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* Card header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: color, flexShrink: 0 }} />

        {/* Clickable area to expand */}
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={toggleExpand}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{getDayName(session.day_type)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatDate(session.date)}{session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
          </div>
        </div>

        {/* Expand chevron */}
        <button
          onClick={toggleExpand}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', padding: '4px 6px', lineHeight: 1 }}
        >
          {expanded ? '▲' : '▼'}
        </button>

        {/* Edit + Delete */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={() => onEdit(session)}
            title="Edit session"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
              fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'inherit',
            }}
          >✏️</button>
          <button
            onClick={() => onDeleteRequest(session.id)}
            title="Delete session"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
              fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'inherit',
            }}
          >🗑️</button>
        </div>
      </div>

      {/* Expanded sets view */}
      {expanded && (
        <div style={{ marginTop: '14px', marginLeft: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          {loadingSets ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading sets...</p>
          ) : sets && sets.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No sets logged for this session.</p>
          ) : (
            Object.entries(byExercise).map(([exerciseName, rows]) => (
              <div key={exerciseName} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  {exerciseName}
                </div>
                {/* Set rows header */}
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: '4px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>SET</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>WEIGHT</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>REPS</div>
                </div>
                {rows.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: '4px', padding: '4px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: color }}>{row.set_number}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {row.weight_kg === null ? 'BW' : row.weight_kg != null ? `${row.weight_kg} kg` : '—'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {row.reps != null ? `${row.reps}` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          {/* Notes */}
          {session.notes && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
              📝 {session.notes}
            </div>
          )}
        </div>
      )}

      {/* Notes preview when collapsed */}
      {!expanded && session.notes && (
        <div style={{ marginTop: '10px', marginLeft: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          {session.notes}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main SessionLog component
// ─────────────────────────────────────────────
export default function SessionLog() {
  const { user } = useAuth()
  const [view, setView] = useState('history') // history | log
  const [programs, setPrograms] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingSession, setEditingSession] = useState(null)

  // Active session state
  const [selectedDay, setSelectedDay] = useState('day1')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [exerciseSets, setExerciseSets] = useState({})

  useEffect(() => {
    fetchPrograms()
    fetchSessions()
  }, [])

  async function fetchPrograms() {
    const { data } = await supabase.from('programs').select('*').eq('user_id', user.id).order('day_type')
    if (data) setPrograms(data)
  }

  async function fetchSessions() {
    setLoading(true)
    const { data } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
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
    if (!editingSession && currentProgram) initExercises(currentProgram)
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

  async function startEdit(session) {
    const { data: setsData } = await supabase
      .from('session_sets')
      .select('*')
      .eq('session_id', session.id)
      .order('set_number')

    const rebuilt = {}
    if (setsData) {
      setsData.forEach(row => {
        if (!rebuilt[row.exercise_name]) rebuilt[row.exercise_name] = []
        rebuilt[row.exercise_name].push({
          weight: row.weight_kg === null ? 'BW' : String(row.weight_kg ?? ''),
          reps: String(row.reps ?? ''),
        })
      })
    }

    const program = programs.find(p => p.day_type === session.day_type)
    if (program) {
      program.exercises.forEach(ex => {
        if (!rebuilt[ex]) rebuilt[ex] = [{ weight: '', reps: '' }]
      })
    }

    setEditingSession(session)
    setSelectedDay(session.day_type)
    setSessionDate(session.date)
    setDuration(session.duration_minutes ? String(session.duration_minutes) : '')
    setSessionNotes(session.notes || '')
    setExerciseSets(rebuilt)
    setView('log')
  }

  function cancelLog() {
    setEditingSession(null)
    setView('history')
    setSelectedDay('day1')
    setSessionDate(new Date().toISOString().split('T')[0])
    setDuration('')
    setSessionNotes('')
  }

  async function saveSession() {
    setSaving(true)

    let sessionId

    if (editingSession) {
      const { error } = await supabase
        .from('sessions')
        .update({
          day_type: selectedDay,
          user_id: user.id,
          date: sessionDate,
          duration_minutes: duration ? parseInt(duration) : null,
          notes: sessionNotes || null,
        })
        .eq('id', editingSession.id)

      if (error) { setSaving(false); alert('Failed to update session'); return }
      await supabase.from('session_sets').delete().eq('session_id', editingSession.id)
      sessionId = editingSession.id
    } else {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          day_type: selectedDay,
          user_id: user.id,
          date: sessionDate,
          duration_minutes: duration ? parseInt(duration) : null,
          notes: sessionNotes || null,
        }])
        .select()

      if (sessionError || !sessionData?.[0]) { setSaving(false); alert('Failed to save session'); return }
      sessionId = sessionData[0].id
    }

    const setsToInsert = []
    Object.entries(exerciseSets).forEach(([exercise, sets]) => {
      sets.forEach((set, idx) => {
        const isBW = set.weight === 'BW'
        if (isBW || set.weight || set.reps) {
          setsToInsert.push({
            session_id: sessionId,
            user_id: user.id,
            exercise_name: exercise,
            set_number: idx + 1,
            weight_kg: isBW ? null : (set.weight ? parseFloat(set.weight) : null),
            reps: set.reps ? parseInt(set.reps) : null,
          })
        }
      })
    })

    if (setsToInsert.length > 0) {
      await supabase.from('session_sets').insert(setsToInsert)
    }

    setEditingSession(null)
    setSuccess(true)
    setView('history')
    fetchSessions()
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function deleteSession(sessionId) {
    await supabase.from('session_sets').delete().eq('session_id', sessionId)
    await supabase.from('sessions').delete().eq('id', sessionId)
    setDeletingId(null)
    fetchSessions()
  }

  function getDayName(dayType) {
    const p = programs.find(p => p.day_type === dayType)
    return p ? `Day ${dayType.replace('day', '')} — ${p.day_name}` : dayType
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
          onClick={() => view === 'log' ? cancelLog() : setView('log')}
        >
          {view === 'log' ? 'Cancel' : '+ Log Session'}
        </button>
      </div>

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#16a34a' }}>
          ✅ Session {editingSession ? 'updated' : 'saved'} successfully.
        </div>
      )}

      {/* LOG / EDIT VIEW */}
      {view === 'log' && (
        <div>
          {editingSession && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              ✏️ Editing session from <strong>{formatDate(editingSession.date)}</strong>
            </div>
          )}

          {/* Day selector */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Day</label>
              <select
                className="form-input"
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value)}
                disabled={!!editingSession}
              >
                {programs.map(p => (
                  <option key={p.day_type} value={p.day_type}>
                    Day {p.day_type.replace('day', '')} — {p.day_name}
                  </option>
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
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {exerciseSets[exercise]?.length || 0} sets
                </span>
              </div>

              {/* Set headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1.5fr 1fr 32px', gap: '6px', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SET</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>KG</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>REPS</div>
                <div />
              </div>

              {/* Set rows */}
              {(exerciseSets[exercise] || []).map((set, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '32px 1.5fr 1fr 32px', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: DAY_COLORS[selectedDay], textAlign: 'center' }}>
                    {idx + 1}
                  </div>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={set.weight === 'BW' ? 'BW' : '0'}
                      value={set.weight === 'BW' ? '' : set.weight}
                      disabled={set.weight === 'BW'}
                      onChange={e => updateSet(exercise, idx, 'weight', e.target.value)}
                      style={{
                        padding: '8px',
                        textAlign: 'center',
                        flex: 1,
                        minWidth: 0,
                        background: set.weight === 'BW' ? 'var(--bg)' : undefined,
                        opacity: set.weight === 'BW' ? 0.5 : 1,
                      }}
                    />
                    <button
                      onClick={() => updateSet(exercise, idx, 'weight', set.weight === 'BW' ? '' : 'BW')}
                      style={{
                        flexShrink: 0,
                        padding: '8px 6px',
                        border: `1.5px solid ${set.weight === 'BW' ? DAY_COLORS[selectedDay] : 'var(--border)'}`,
                        borderRadius: '6px',
                        background: set.weight === 'BW' ? DAY_COLORS[selectedDay] : 'var(--surface)',
                        color: set.weight === 'BW' ? '#fff' : 'var(--text-muted)',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >BW</button>
                  </div>

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
            {saving ? 'Saving...' : editingSession ? 'Update Session' : 'Save Session'}
          </button>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <>
          {loading ? (
            <div className="card">
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '14px' }}>Loading...</p>
            </div>
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
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged · tap a card to see sets
              </div>

              {sessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  getDayName={getDayName}
                  formatDate={formatDate}
                  onEdit={startEdit}
                  onDeleteRequest={(id) => setDeletingId(id)}
                  deletingId={deletingId}
                  onDeleteConfirm={deleteSession}
                  onDeleteCancel={() => setDeletingId(null)}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
