export default function SessionLog() {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Session Log</h1>
          <p className="page-subtitle">Track your workouts and watch your progress over time</p>
        </div>
  
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">No sessions logged yet</p>
            <p className="empty-state-sub">Your workout history will appear here once logging is set up</p>
          </div>
        </div>
      </div>
    )
  }