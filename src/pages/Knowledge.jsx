import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Training', 'Nutrition', 'Recovery', 'Mindset', 'Other']

export default function Knowledge() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // list | new | read
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('All')

  const [form, setForm] = useState({
    title: '', body: '', category: 'Training', image_url: '', link_url: ''
  })

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  async function saveEntry() {
    if (!form.title.trim() || !form.body.trim()) return
    setSaving(true)
    const { error } = await supabase.from('knowledge_entries').insert([{
      user_id: user.id,
      title: form.title.trim(),
      body: form.body.trim(),
      category: form.category,
      image_url: form.image_url.trim() || null,
      link_url: form.link_url.trim() || null,
    }])
    if (!error) {
      setForm({ title: '', body: '', category: 'Training', image_url: '', link_url: '' })
      setView('list')
      fetchEntries()
    }
    setSaving(false)
  }

  async function deleteEntry(id) {
    await supabase.from('knowledge_entries').delete().eq('id', id)
    setView('list')
    fetchEntries()
  }

  const filtered = filterCat === 'All' ? entries : entries.filter(e => e.category === filterCat)

  const catColors = {
    Training: '#ef4444', Nutrition: '#10b981', Recovery: '#3b82f6',
    Mindset: '#8b5cf6', Other: '#6b7280'
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">Your training insights, nutrition notes — any language</p>
        </div>
        {view === 'list' && (
          <button className="btn btn-primary" onClick={() => setView('new')}>+ Write</button>
        )}
        {view !== 'list' && (
          <button className="btn btn-secondary" onClick={() => { setView('list'); setSelected(null) }}>← Back</button>
        )}
      </div>

      {/* NEW ENTRY */}
      {view === 'new' && (
        <div>
          <div className="card" style={{ marginBottom: '12px' }}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="What's this about?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Write anything — English, Marathi, Munglish. Your knowledge, your words."
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                style={{ minHeight: '200px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL (optional)</label>
              <input className="form-input" placeholder="https://..." value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Video / Link URL (optional)</label>
              <input className="form-input" placeholder="Google Drive, YouTube, or any link..." value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={saveEntry}
            disabled={saving || !form.title.trim() || !form.body.trim()}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      )}

      {/* READ ENTRY */}
      {view === 'read' && selected && (
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px',
                  fontWeight: 700, background: `${catColors[selected.category]}20`,
                  color: catColors[selected.category], marginBottom: '8px'
                }}>{selected.category}</span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>{selected.title}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{formatDate(selected.created_at)}</p>
              </div>
              <button
                onClick={() => deleteEntry(selected.id)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: 'var(--danger)', fontSize: '12px' }}
              >Delete</button>
            </div>

            {selected.image_url && (
              <img src={selected.image_url} alt="" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', objectFit: 'cover', maxHeight: '300px' }} />
            )}

            <div style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: selected.link_url ? '16px' : 0 }}>
              {selected.body}
            </div>

            {selected.link_url && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <a href={selected.link_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                  color: 'var(--accent)', fontWeight: 500, textDecoration: 'none',
                  background: 'var(--accent-light)', padding: '8px 14px', borderRadius: '8px'
                }}>▶ Open Link / Video</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIST */}
      {view === 'list' && (
        <>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: '20px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                background: filterCat === cat ? (catColors[cat] || 'var(--primary)') : 'var(--surface)',
                color: filterCat === cat ? '#fff' : 'var(--text-secondary)',
                border: filterCat === cat ? 'none' : '1px solid var(--border)',
              }}>{cat}</button>
            ))}
          </div>

          {loading ? (
            <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '14px' }}>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <p className="empty-state-text">No entries yet</p>
                <p className="empty-state-sub">Hit "+ Write" to document your first insight</p>
              </div>
            </div>
          ) : (
            filtered.map(entry => (
              <div key={entry.id} className="card" style={{ marginBottom: '12px', cursor: 'pointer' }}
                onClick={() => { setSelected(entry); setView('read') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '10px',
                      fontWeight: 700, background: `${catColors[entry.category]}20`,
                      color: catColors[entry.category], marginBottom: '6px'
                    }}>{entry.category}</span>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{entry.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{formatDate(entry.created_at)}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {entry.body}
                    </div>
                  </div>
                  {entry.link_url && <span style={{ fontSize: '16px', marginLeft: '12px', flexShrink: 0 }}>▶</span>}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
