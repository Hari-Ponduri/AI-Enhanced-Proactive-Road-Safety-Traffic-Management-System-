import { useState, useEffect } from 'react';

export default function DriverSafety() {
  const [drowsinessEvents, setDrowsinessEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = () => {
      fetch('http://localhost:8080/api/drowsiness')
        .then(res => res.json())
        .then(data => setDrowsinessEvents(data))
        .catch(err => console.error("Failed to fetch drowsiness events", err));
    };
    
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{ gridColumn: '1 / -1', borderColor: '#ff9800' }}>
      <h2 style={{ color: '#ff9800' }}>👁️ Driver Safety & Monitoring</h2>
      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
        Note: The system monitors facial landmarks for physical cues of fatigue (EAR/MAR). It cannot conclusively prove intoxication.
      </p>

      <div style={{ marginTop: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
        {drowsinessEvents.length === 0 ? (
          <p style={{ color: '#666' }}>No driver safety events detected yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {drowsinessEvents.map((ev, idx) => (
              <div key={idx} style={{ 
                padding: '1rem', 
                border: `1px solid ${ev.warningLevel === 'CRITICAL' ? '#f44336' : '#ff9800'}`, 
                borderRadius: '8px', 
                backgroundColor: ev.warningLevel === 'CRITICAL' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: ev.warningLevel === 'CRITICAL' ? '#f44336' : '#ff9800' }}>
                    {ev.cueType.replace('_', ' ')} DETECTED
                  </h3>
                  <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{new Date(ev.trafficEvent.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Warning Level:</strong> {ev.warningLevel}</p>
                  
                  {ev.warningLevel === 'CRITICAL' && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d32f2f', color: 'white', fontWeight: 'bold', borderRadius: '4px', textAlign: 'center' }}>
                      ⚠️ POSSIBLE IMPAIRED/UNSAFE DRIVING — REQUIRES HUMAN REVIEW
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  {ev.trafficEvent.evidencePath && (
                    <a href={`http://localhost:8000${ev.trafficEvent.evidencePath}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                      View Driver Camera Feed
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
