import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const GOALS = ['Fat Loss', 'Muscle Gain', 'Strength', 'Athletic Performance', 'General Fitness', 'Endurance']

const goalColors = {
  'Fat Loss': '#ef4444', 'Muscle Gain': '#3b82f6', 'Strength': '#f59e0b',
  'Athletic Performance': '#8b5cf6', 'General Fitness': '#10b981', 'Endurance': '#06b6d4'
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Moved OUTSIDE main component — fixes input focus bug
function ProgramForm({ form, setForm, onSave, saving, isEdit }) {
  return (
    <div>
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="form-group">
          <label className="form-label">Client Name</label>
          <input
            className="form-input"
            placeholder="Who is this for?"
            value={form.client_name}
            onChange={e => setForm({ ...form, client_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Goal</label>
          <select className="form-input" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
            {GOALS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Program Details</label>
          <textarea
            className="form-input form-textarea"
            placeholder={`Day 1 - Chest + Triceps\n- Bench Press: 4x6\n- Incline DB Press: 3x10\n\nDay 2 - Back + Biceps\n- Pull-ups: 4x6\n...`}
            value={form.program_details}
            onChange={e => setForm({ ...form, program_details: e.target.value })}
            style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: '13px' }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Coach Notes (optional)</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Notes for yourself — injuries, preferences, progression..."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={onSave}
        disabled={saving || !form.client_name.trim() || !form.program_details.trim()}
        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
      >
        {saving ? 'Saving...' : isEdit ? 'Update Program' : 'Save Program'}
      </button>
    </div>
  )
}

export default function ClientPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    client_name: '', goal: 'General Fitness', program_details: '', notes: '',
  })

  useEffect(() => { fetchPrograms() }, [])

  async function fetchPrograms() {
    setLoading(true)
    const { data } = await supabase.from('client_programs').select('*').order('created_at', { ascending: false })
    if (data) setPrograms(data)
    setLoading(false)
  }

  async function saveProgram() {
    if (!form.client_name.trim() || !form.program_details.trim()) return
    setSaving(true)
    const { error } = await supabase.from('client_programs').insert([{
      client_name: form.client_name.trim(),
      goal: form.goal,
      program_details: form.program_details.trim(),
      notes: form.notes.trim() || null,
    }])
    if (!error) {
      setForm({ client_name: '', goal: 'General Fitness', program_details: '', notes: '' })
      setView('list')
      fetchPrograms()
    }
    setSaving(false)
  }

  async function updateProgram() {
    if (!form.client_name.trim() || !form.program_details.trim()) return
    setSaving(true)
    const { error } = await supabase.from('client_programs').update({
      client_name: form.client_name.trim(),
      goal: form.goal,
      program_details: form.program_details.trim(),
      notes: form.notes.trim() || null,
    }).eq('id', selected.id)
    if (!error) {
      setView('list')
      fetchPrograms()
    }
    setSaving(false)
  }

  async function deleteProgram(id) {
    await supabase.from('client_programs').delete().eq('id', id)
    setView('list')
    fetchPrograms()
  }

  function startEdit(program) {
    setSelected(program)
    setForm({
      client_name: program.client_name,
      goal: program.goal,
      program_details: program.program_details,
      notes: program.notes || '',
    })
    setView('edit')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Client Programs</h1>
          <p className="page-subtitle">Programs you've built for the people you train</p>
        </div>
        {view === 'list' && (
          <button className="btn btn-primary" onClick={() => {
            setForm({ client_name: '', goal: 'General Fitness', program_details: '', notes: '' })
            setView('new')
          }}>+ New Program</button>
        )}
        {view !== 'list' && (
          <button className="btn btn-secondary" onClick={() => { setView('list'); setSelected(null) }}>← Back</button>
        )}
      </div>

      {/* New */}
      {view === 'new' && (
        <ProgramForm form={form} setForm={setForm} onSave={saveProgram} saving={saving} isEdit={false} />
      )}

      {/* Edit */}
      {view === 'edit' && (
        <ProgramForm form={form} setForm={setForm} onSave={updateProgram} saving={saving} isEdit={true} />
      )}

      {/* Read */}
      {view === 'read' && selected && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: goalColors[selected.goal] || '#6366f1', color: '#fff', fontSize: '16px', fontWeight: 700
              }}>{getInitials(selected.client_name)}</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{selected.client_name}</div>
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 700, marginTop: '4px',
                  background: `${goalColors[selected.goal]}20`, color: goalColors[selected.goal]
                }}>{selected.goal}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => startEdit(selected)} className="btn btn-secondary btn-sm">Edit</button>
              <button onClick={() => deleteProgram(selected.id)} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '6px 10px', cursor: 'pointer', color: 'var(--danger)', fontSize: '12px'
              }}>Delete</button>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Created {formatDate(selected.created_at)}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Program</div>
            <pre style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
              {selected.program_details}
            </pre>
          </div>

          {selected.notes && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Coach Notes</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selected.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <>
          {loading ? (
            <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '14px' }}>Loading...</p></div>
          ) : programs.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p className="empty-state-text">No client programs yet</p>
                <p className="empty-state-sub">Build a program for someone you train</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {programs.length} program{programs.length !== 1 ? 's' : ''}
              </div>
              {programs.map(program => (
                <div key={program.id} className="card" style={{ marginBottom: '12px', cursor: 'pointer' }}
                  onClick={() => { setSelected(program); setView('read') }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: goalColors[program.goal] || '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 700
                    }}>{getInitials(program.client_name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>{program.client_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '1px 8px', borderRadius: '20px',
                          background: `${goalColors[program.goal]}20`, color: goalColors[program.goal]
                        }}>{program.goal}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(program.created_at)}</span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}


