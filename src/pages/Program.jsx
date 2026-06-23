import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

const DAY_COLORS = {
  day1: '#ef4444', day2: '#3b82f6', day3: '#8b5cf6',
  day4: '#10b981', day5: '#f59e0b'
}

const PHASE_MAP = {
  day1: [
    { phase: '🔴 Power', exercises: ['Plyometric Push-up', 'Med Ball Chest Pass'] },
    { phase: '🟠 Strength', exercises: ['Barbell Bench Press', 'Weighted Dips'] },
    { phase: '🟡 Hypertrophy', exercises: ['Incline DB Press', 'Cable Fly', 'Overhead Tricep Extension', 'Tricep Pushdown'] },
    { phase: '🟢 Explosive Finisher', exercises: ['Clap Push-ups'] },
  ],
  day2: [
    { phase: '🔴 Skill — Muscle-up', exercises: ['Scapular Pull-ups', 'Weighted Pull-ups', 'False Grip Pull', 'Chest-to-Bar Pull-ups'] },
    { phase: '🟠 Strength', exercises: ['Barbell Bent-over Row', 'Pendlay Row'] },
    { phase: '🟡 Hypertrophy', exercises: ['Lat Pulldown', 'Seated Cable Row', 'Face Pulls', 'DB Hammer Curl', 'Incline DB Curl'] },
    { phase: '🟢 Explosive Finisher', exercises: ['Kettlebell Swings'] },
  ],
  day3: [
    { phase: '🔴 Power', exercises: ['Barbell Push Press'] },
    { phase: '🟠 Strength', exercises: ['Seated DB Shoulder Press'] },
    { phase: '🟡 Hypertrophy', exercises: ['Arnold Press', 'Lateral Raise', 'Rear Delt Fly', 'Cable Upright Row'] },
    { phase: '🔵 Athletic Core', exercises: ['Hanging Leg Raise', 'Ab Wheel Rollout', 'Pallof Press'] },
    { phase: '🟢 Explosive Finisher', exercises: ['Med Ball Slam'] },
  ],
  day4: [
    { phase: '🔴 Power', exercises: ['Box Jumps', 'Broad Jump'] },
    { phase: '🟠 Strength', exercises: ['Barbell Back Squat', 'Romanian Deadlift'] },
    { phase: '🟡 Hypertrophy', exercises: ['Bulgarian Split Squat', 'Leg Press', 'Leg Curl', 'Standing Calf Raise', 'Seated Calf Raise'] },
    { phase: '🟢 Explosive Finisher', exercises: ['Jump Squats'] },
  ],
  day5: [
    { phase: '❤️ Zone 2', exercises: ['Zone 2 Treadmill'] },
    { phase: '⚡ HIIT', exercises: ['HIIT Sprints'] },
    { phase: '🔥 KB Circuit', exercises: ['Kettlebell Swings', 'Goblet Squats', 'KB Clean'] },
    { phase: '🪢 Jump Rope', exercises: ['Jump Rope'] },
  ],
}

export default function Program() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [activeDay, setActiveDay] = useState('day1')
  const [loading, setLoading] = useState(true)
  const [newExercise, setNewExercise] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPrograms() }, [])

  async function fetchPrograms() {
    setLoading(true)
    const { data } = await supabase.from('programs').select('*').eq('user_id', user.id).order('day_type')
    if (data) setPrograms(data)
    setLoading(false)
  }

  const currentProgram = programs.find(p => p.day_type === activeDay)
  const currentColor = DAY_COLORS[activeDay]
  const phases = PHASE_MAP[activeDay] || []

  async function addExercise() {
    if (!newExercise.trim()) return
    setSaving(true)

    if (currentProgram) {
      const updated = [...currentProgram.exercises, newExercise.trim()]
      await supabase.from('programs').update({ exercises: updated }).eq('id', currentProgram.id)
    } else {
      // Create program row for this day if it doesn't exist yet
      await supabase.from('programs').insert([{
        user_id: user.id,
        day_type: activeDay,
        day_name: `Day ${activeDay.replace('day', '')}`,
        exercises: [newExercise.trim()]
      }])
    }

    setNewExercise('')
    fetchPrograms()
    setSaving(false)
  }

  async function removeExercise(ex) {
    if (!currentProgram) return
    const updated = currentProgram.exercises.filter(e => e !== ex)
    await supabase.from('programs').update({ exercises: updated }).eq('id', currentProgram.id)
    fetchPrograms()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Program</h1>
        <p className="page-subtitle">4-day athlete split + cardio · Power · Strength · Hypertrophy · Explosive</p>
      </div>

      {/* Day Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['day1','day2','day3','day4','day5'].map(day => (
          <button key={day} onClick={() => setActiveDay(day)} style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.15s',
            background: activeDay === day ? DAY_COLORS[day] : 'var(--surface)',
            color: activeDay === day ? '#fff' : 'var(--text-secondary)',
            border: activeDay === day ? 'none' : '1px solid var(--border)',
          }}>
            Day {day.replace('day', '')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card"><p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px', fontSize: '14px' }}>Loading...</p></div>
      ) : (
        <>
          {currentProgram && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: currentColor }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentProgram.day_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentProgram.exercises.length} exercises</div>
              </div>
            </div>
          )}

          {/* Phases */}
          {phases.map((block, bi) => (
            <div key={bi} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: currentColor, textTransform: 'uppercase', marginBottom: '10px' }}>
                {block.phase}
              </div>
              {block.exercises.map((ex, ei) => (
                <div key={ei} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: ei < block.exercises.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{ex}</span>
                  {currentProgram && (
                    <button onClick={() => removeExercise(ex)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: '16px', padding: '2px 6px', borderRadius: '4px'
                    }}>×</button>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Additional exercises not in phases */}
          {currentProgram && currentProgram.exercises.filter(ex => !phases.flatMap(p => p.exercises).includes(ex)).length > 0 && (
            <div className="card" style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Additional Exercises
              </div>
              {currentProgram.exercises.filter(ex => !phases.flatMap(p => p.exercises).includes(ex)).map((ex, ei, arr) => (
                <div key={ei} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: ei < arr.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{ fontSize: '14px' }}>{ex}</span>
                  <button onClick={() => removeExercise(ex)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '16px', padding: '2px 6px'
                  }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Add Exercise */}
          <div className="card">
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>+ Add Exercise</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                placeholder="Exercise name..."
                value={newExercise}
                onChange={e => setNewExercise(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExercise()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={addExercise} disabled={saving || !newExercise.trim()}>
                Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
