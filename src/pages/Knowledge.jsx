export default function Knowledge() {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">Your training insights, nutrition notes, and principles — in any language</p>
        </div>
  
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p className="empty-state-text">Your knowledge base is empty</p>
            <p className="empty-state-sub">Write training notes, nutrition insights, or paste anything useful here</p>
          </div>
        </div>
      </div>
    )
  }