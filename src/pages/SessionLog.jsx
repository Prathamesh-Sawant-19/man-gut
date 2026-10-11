import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

const DAY_COLORS = {
  day1: '#ef4444', day2: '#3b82f6', day3: '#8b5cf6',
  day4: '#10b981', day5: '#f59e0b'
}

// ─────────────────────────────────────────────
// Rest Timer component — tap pill to pause/resume
// ─────────────────────────────────────────────
function RestTimer({ active, paused, seconds, onTogglePause, onDismiss }) {
  if (!active) return null
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${mins}:${String(secs).padStart(2, '0')}`
  const urgent = seconds <= 10 && !paused

  return (
    <div
      onClick={onTogglePause}
      title={paused ? 'Tap to resume' : 'Tap to pause'}
      style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        background: paused ? '#475569' : urgent ? '#dc2626' : '#1e293b',
        color: '#fff', borderRadius: '12px', padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)', zIndex: 1000,
        minWidth: '240px', justifyContent: 'space-between',
        transition: 'background 0.3s',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', opacity: 0.7, marginBottom: '2px' }}>
          {paused ? 'PAUSED — tap to resume' : 'REST'}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {display}
          <span style={{ fontSize: '18px', opacity: 0.7 }}>{paused ? '▶' : '⏸'}</span>
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDismiss() }}
        style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
          borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px',
          fontWeight: 700, fontFamily: 'inherit',
        }}
      >
        Skip
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// History card — expandable to show sets
// ─────────────────────────────────────────────
function SessionCard({ session, getDayName, formatDate, onEdit, onDeleteRequest, deletingId, onDeleteConfirm, onDeleteCancel }) {
  const [expanded, setExpanded] = useState(false)
  const [sets, setSets] = useState(null)
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

  const byExercise = {}
  if (sets) {
    sets.forEach(row => {
      if (!byExercise[row.exercise_name]) byExercise[row.exercise_name] = []
      byExercise[row.exercise_name].push(row)
    })
  }

  const color = DAY_COLORS[session.day_type] || '#6366f1'
  const hasPR = session.has_pr

  return (
    <div className="card" style={{ marginBottom: '12px' }}>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: color, flexShrink: 0 }} />

        <div style={{ flex: 1, cursor: 'pointer' }} onClick={toggleExpand}>
          <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {getDayName(session.day_type)}
            {hasPR && <span title="Personal record this session!" style={{ fontSize: '13px' }}>🏆</span>}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatDate(session.date)}{session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
          </div>
        </div>

        <button
          onClick={toggleExpand}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', padding: '4px 6px', lineHeight: 1 }}
        >
          {expanded ? '▲' : '▼'}
        </button>

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

      {expanded && (
        <div style={{ marginTop: '14px', marginLeft: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          {loadingSets ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading sets...</p>
          ) : sets && sets.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No sets logged for this session.</p>
          ) : (
            Object.entries(byExercise).map(([exerciseName, rows]) => (
              <div key={exerciseName} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {exerciseName}
                  {rows.some(r => r.is_pr) && <span title="PR set">🏆</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: '4px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>SET</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>WEIGHT</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>REPS</div>
                  <div />
                </div>
                {rows.map((row, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: '4px',
                    padding: '4px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    background: row.is_pr ? 'rgba(251,191,36,0.06)' : 'transparent',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: color }}>{row.set_number}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {row.weight_kg === null ? 'BW' : row.weight_kg != null ? `${row.weight_kg} kg` : '—'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {row.reps != null ? `${row.reps}` : '—'}
                    </div>
                    <div style={{ fontSize: '13px' }}>{row.is_pr ? '🏆' : ''}</div>
                  </div>
                ))}
              </div>
            ))
          )}

          {session.notes && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
              📝 {session.notes}
            </div>
          )}
        </div>
      )}

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
  const [view, setView] = useState('history')
  const [programs, setPrograms] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [editingSession, setEditingSession] = useState(null)

  // Last session reference data: { exerciseName -> [{ weight_kg, reps, set_number }] }
  const [lastSessionSets, setLastSessionSets] = useState({})

  // Tracks which sets have been marked done: { "exerciseName-idx": true }
  const [doneSets, setDoneSets] = useState({})

  // Active session state
  const [selectedDay, setSelectedDay] = useState('day1')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [exerciseSets, setExerciseSets] = useState({})

  // Rest timer
  const [timerActive, setTimerActive] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const timerRef = useRef(null)
  const DEFAULT_REST = 90 // seconds

  useEffect(() => {
    fetchPrograms()
    fetchSessions()
  }, [])

  // Timer tick — only runs when active AND not paused
  useEffect(() => {
    if (timerActive && !timerPaused) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTimerActive(false)
            setTimerPaused(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerActive, timerPaused])

  function startTimer() {
    clearInterval(timerRef.current)
    setTimerSeconds(DEFAULT_REST)
    setTimerPaused(false)
    setTimerActive(true)
  }

  function togglePause() {
    setTimerPaused(prev => !prev)
  }

  function dismissTimer() {
    clearInterval(timerRef.current)
    setTimerActive(false)
    setTimerPaused(false)
    setTimerSeconds(0)
  }

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

  // Load last session sets for the selected day (for reference while logging)
  async function loadLastSessionSets(dayType) {
    // Find the most recent previous session for this day_type (skip editingSession)
    const { data: prevSessions } = await supabase
      .from('sessions')
      .select('id, date')
      .eq('user_id', user.id)
      .eq('day_type', dayType)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!prevSessions || prevSessions.length === 0) {
      setLastSessionSets({})
      return
    }

    // Pick the first session that isn't the one being edited
    const prev = prevSessions.find(s => !editingSession || s.id !== editingSession.id)
    if (!prev) { setLastSessionSets({}); return }

    const { data: sets } = await supabase
      .from('session_sets')
      .select('exercise_name, set_number, weight_kg, reps')
      .eq('session_id', prev.id)
      .order('exercise_name')
      .order('set_number')

    if (!sets) { setLastSessionSets({}); return }

    const byEx = {}
    sets.forEach(row => {
      if (!byEx[row.exercise_name]) byEx[row.exercise_name] = []
      byEx[row.exercise_name].push(row)
    })
    setLastSessionSets(byEx)
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

  // When day changes, load last session for reference
  useEffect(() => {
    if (view === 'log') {
      loadLastSessionSets(selectedDay)
    }
  }, [selectedDay, view])

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

  function markSetDone(exercise, idx) {
    const key = `${exercise}-${idx}`
    setDoneSets(prev => {
      const alreadyDone = prev[key]
      if (!alreadyDone) startTimer()
      return { ...prev, [key]: !alreadyDone }
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
    loadLastSessionSets(session.day_type)
  }

  function cancelLog() {
    setEditingSession(null)
    setView('history')
    setSelectedDay('day1')
    setSessionDate(new Date().toISOString().split('T')[0])
    setDuration('')
    setSessionNotes('')
    dismissTimer()
    setLastSessionSets({})
    setDoneSets({})
  }

  // Fetch all-time best weight×reps (e1RM proxy: weight × reps) for PR detection
  async function fetchPRMap() {
    const { data } = await supabase
      .from('session_sets')
      .select('exercise_name, weight_kg, reps')
      .eq('user_id', user.id)
    if (!data) return {}
    const prMap = {}
    data.forEach(row => {
      if (row.weight_kg == null || row.reps == null) return
      const score = row.weight_kg * row.reps
      if (!prMap[row.exercise_name] || score > prMap[row.exercise_name]) {
        prMap[row.exercise_name] = score
      }
    })
    return prMap
  }

  async function saveSession() {
    setSaving(true)
    dismissTimer()

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

    // Fetch existing PRs before inserting new sets
    const existingPRMap = await fetchPRMap()

    const setsToInsert = []
    let sessionHasPR = false

    Object.entries(exerciseSets).forEach(([exercise, sets]) => {
      sets.forEach((set, idx) => {
        const isBW = set.weight === 'BW'
        if (isBW || set.weight || set.reps) {
          const wkg = isBW ? null : (set.weight ? parseFloat(set.weight) : null)
          const reps = set.reps ? parseInt(set.reps) : null
          // PR detection: new score beats existing record
          let isPR = false
          if (wkg != null && reps != null) {
            const score = wkg * reps
            const prevBest = existingPRMap[exercise] || 0
            if (score > prevBest) {
              isPR = true
              sessionHasPR = true
              existingPRMap[exercise] = score // update in-memory so only first new PR counts
            }
          }
          setsToInsert.push({
            session_id: sessionId,
            user_id: user.id,
            exercise_name: exercise,
            set_number: idx + 1,
            weight_kg: isBW ? null : (set.weight ? parseFloat(set.weight) : null),
            reps: set.reps ? parseInt(set.reps) : null,
            is_pr: isPR,
          })
        }
      })
    })

    if (setsToInsert.length > 0) {
      await supabase.from('session_sets').insert(setsToInsert)
    }

    // Update session with has_pr flag
    if (sessionHasPR) {
      await supabase.from('sessions').update({ has_pr: true }).eq('id', sessionId)
    }

    setEditingSession(null)
    const msg = sessionHasPR
      ? (editingSession ? 'Session updated. 🏆 New personal record!' : 'Session saved. 🏆 New personal record!')
      : (editingSession ? 'Session updated.' : 'Session saved.')
    setSuccessMsg(msg)
    setSuccess(true)
    setView('history')
    setLastSessionSets({})
    setDoneSets({})
    fetchSessions()
    setSaving(false)
    setTimeout(() => setSuccess(false), 4000)
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

  // Helper: get last session reference for an exercise
  function getLastRef(exercise) {
    return lastSessionSets[exercise] || []
  }

  return (
    <div>
      <RestTimer active={timerActive} paused={timerPaused} seconds={timerSeconds} onTogglePause={togglePause} onDismiss={dismissTimer} />

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
        <div style={{
          background: successMsg.includes('🏆') ? '#fefce8' : '#f0fdf4',
          border: `1px solid ${successMsg.includes('🏆') ? '#fde68a' : '#86efac'}`,
          borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
          fontSize: '14px', color: successMsg.includes('🏆') ? '#92400e' : '#16a34a',
          fontWeight: 500,
        }}>
          ✅ {successMsg}
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

          {/* Last session reference banner */}
          {Object.keys(lastSessionSets).length > 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 14px', marginBottom: '16px',
              fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              📋 <span>Showing last session weights below each exercise — beat them.</span>
            </div>
          )}

          {/* Exercises */}
          {currentProgram?.exercises.map(exercise => {
            const lastRef = getLastRef(exercise)
            return (
              <div key={exercise} className="card" style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  {exercise}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {exerciseSets[exercise]?.length || 0} sets
                  </span>
                </div>

                {/* Last session reference */}
                {lastRef.length > 0 && (
                  <div style={{
                    fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px',
                    padding: '5px 8px', background: 'var(--bg)', borderRadius: '5px',
                    borderLeft: `2px solid ${DAY_COLORS[selectedDay]}`,
                  }}>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>Last:</span>
                    {lastRef.map((r, i) => (
                      <span key={i} style={{ marginRight: '8px' }}>
                        {r.weight_kg === null ? 'BW' : `${r.weight_kg}kg`}×{r.reps}
                      </span>
                    ))}
                  </div>
                )}

                {/* Set headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1.5fr 1fr 36px 28px', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SET</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>KG</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>REPS</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>✓</div>
                  <div />
                </div>

                {/* Set rows */}
                {(exerciseSets[exercise] || []).map((set, idx) => {
                  const doneKey = `${exercise}-${idx}`
                  const isDone = !!doneSets[doneKey]
                  return (
                    <div key={idx} style={{
                      display: 'grid', gridTemplateColumns: '28px 1.5fr 1fr 36px 28px', gap: '6px',
                      marginBottom: '6px', alignItems: 'center',
                      background: isDone ? 'rgba(16,185,129,0.06)' : 'transparent',
                      borderRadius: '6px', padding: isDone ? '2px 4px' : '0',
                      transition: 'background 0.2s',
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isDone ? '#10b981' : DAY_COLORS[selectedDay], textAlign: 'center' }}>
                        {idx + 1}
                      </div>

                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="form-input"
                          placeholder={set.weight === 'BW' ? 'BW' : (lastRef[idx]?.weight_kg != null ? String(lastRef[idx].weight_kg) : '0')}
                          value={set.weight === 'BW' ? '' : set.weight}
                          disabled={set.weight === 'BW' || isDone}
                          onChange={e => updateSet(exercise, idx, 'weight', e.target.value)}
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                            flex: 1,
                            minWidth: 0,
                            background: isDone ? 'var(--bg)' : set.weight === 'BW' ? 'var(--bg)' : undefined,
                            opacity: isDone || set.weight === 'BW' ? 0.5 : 1,
                          }}
                        />
                        <button
                          onClick={() => !isDone && updateSet(exercise, idx, 'weight', set.weight === 'BW' ? '' : 'BW')}
                          disabled={isDone}
                          style={{
                            flexShrink: 0,
                            padding: '8px 6px',
                            border: `1.5px solid ${set.weight === 'BW' ? DAY_COLORS[selectedDay] : 'var(--border)'}`,
                            borderRadius: '6px',
                            background: set.weight === 'BW' ? DAY_COLORS[selectedDay] : 'var(--surface)',
                            color: set.weight === 'BW' ? '#fff' : 'var(--text-muted)',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: isDone ? 'default' : 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                            fontFamily: 'inherit',
                            opacity: isDone ? 0.4 : 1,
                          }}
                        >BW</button>
                      </div>

                      <input
                        type="number"
                        className="form-input"
                        placeholder={lastRef[idx]?.reps ? String(lastRef[idx].reps) : '0'}
                        value={set.reps}
                        disabled={isDone}
                        onChange={e => updateSet(exercise, idx, 'reps', e.target.value)}
                        style={{ padding: '8px', textAlign: 'center', opacity: isDone ? 0.5 : 1 }}
                      />

                      {/* ✓ Done button */}
                      <button
                        onClick={() => markSetDone(exercise, idx)}
                        title={isDone ? 'Undo done' : 'Mark set done — starts rest timer'}
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          border: `1.5px solid ${isDone ? '#10b981' : 'var(--border)'}`,
                          background: isDone ? '#10b981' : 'var(--surface)',
                          color: isDone ? '#fff' : 'var(--text-muted)',
                          fontSize: '15px', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                      >✓</button>

                      <button onClick={() => removeSet(exercise, idx)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '16px', padding: '4px'
                      }}>×</button>
                    </div>
                  )
                })}

                <button onClick={() => addSet(exercise)} style={{
                  background: 'none', border: '1px dashed var(--border)', borderRadius: '6px',
                  width: '100%', padding: '6px', cursor: 'pointer', fontSize: '12px',
                  color: 'var(--text-muted)', marginTop: '4px'
                }}>+ Add Set</button>
              </div>
            )
          })}

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
