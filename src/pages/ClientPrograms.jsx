export default function ClientPrograms() {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Client Programs</h1>
          <p className="page-subtitle">Workout plans you've built for others</p>
        </div>
  
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-text">No client programs yet</p>
            <p className="empty-state-sub">Create and share custom programs with the people you train</p>
          </div>
        </div>
      </div>
    )
  }