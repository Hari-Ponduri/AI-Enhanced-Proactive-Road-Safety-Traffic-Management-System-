import { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import Violations from './Violations';
import EmergencyResponse from './EmergencyResponse';
import DriverSafety from './DriverSafety';

function App() {
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [aiStatus, setAiStatus] = useState('unknown');
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check Backend Health
    fetch('http://localhost:8080/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status === 'up' ? 'up' : 'down'))
      .catch(() => setBackendStatus('down'));

    // Check AI Service Health
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setAiStatus(data.status === 'up' ? 'up' : 'down'))
      .catch(() => setAiStatus('down'));

    // Poll Events
    const fetchEvents = () => {
      fetch('http://localhost:8080/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(err => console.error("Failed to fetch events", err));
    };
    
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AI Road Safety & Traffic Management</h1>
        <div className="user-profile">Admin Mode</div>
      </header>
      
      <main className="dashboard-main">
        <aside className="sidebar">
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, cursor: 'pointer' }}>
              <li onClick={() => setActiveTab('dashboard')} style={{ padding: '10px 0', borderBottom: '1px solid #333', color: activeTab === 'dashboard' ? '#4caf50' : 'inherit' }}>Dashboard & Upload</li>
              <li onClick={() => setActiveTab('violations')} style={{ padding: '10px 0', borderBottom: '1px solid #333', color: activeTab === 'violations' ? '#4caf50' : 'inherit' }}>Violations (e-Challan)</li>
              <li onClick={() => setActiveTab('emergency')} style={{ padding: '10px 0', borderBottom: '1px solid #333', color: activeTab === 'emergency' ? '#f44336' : 'inherit' }}>Emergency Response</li>
              <li onClick={() => setActiveTab('driver')} style={{ padding: '10px 0', borderBottom: '1px solid #333', color: activeTab === 'driver' ? '#ff9800' : 'inherit' }}>Driver Safety (Inward)</li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>Live Cameras</li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>Road Hazards</li>
            </ul>
          </nav>
        </aside>

        <section className="content-area">
          {activeTab === 'dashboard' ? (
            <>
              <VideoUpload />

              <div className="card">
                <h2>System Health</h2>
                <div style={{ marginTop: '1rem' }}>
                  <p>
                    <span className={`status-indicator status-${backendStatus}`}></span>
                    Backend API: {backendStatus.toUpperCase()}
                  </p>
                  <p>
                    <span className={`status-indicator status-${aiStatus}`}></span>
                    AI Service: {aiStatus.toUpperCase()}
                  </p>
                  <p>
                    <span className={`status-indicator status-up`}></span>
                    Database: UP
                  </p>
                </div>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h2>Recent Detection Events</h2>
                <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {events.length === 0 ? (
                    <p style={{ color: '#666' }}>No events detected yet. Upload a video.</p>
                  ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Time</th>
                          <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Type</th>
                          <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Confidence</th>
                          <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Evidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((ev, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>{new Date(ev.timestamp).toLocaleTimeString()}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>
                               {ev.eventType === 'HAZARD' ? '⚠️' : '🚨'} {ev.eventType}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>
                               {(ev.confidence * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>
                              {ev.evidencePath ? (
                                <a href={`http://localhost:8000${ev.evidencePath}`} target="_blank" rel="noreferrer" style={{ color: '#4da9ff' }}>
                                  View Frame
                                </a>
                              ) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : activeTab === 'violations' ? (
            <Violations />
          ) : activeTab === 'emergency' ? (
            <EmergencyResponse />
          ) : activeTab === 'driver' ? (
            <DriverSafety />
          ) : null}
        </section>
      </main>
    </div>
  );
}
export default App;
