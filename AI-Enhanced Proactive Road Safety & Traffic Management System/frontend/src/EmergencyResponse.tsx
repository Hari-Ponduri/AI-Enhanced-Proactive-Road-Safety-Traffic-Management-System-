import { useState, useEffect } from 'react';

export default function EmergencyResponse() {
  const [ambulances, setAmbulances] = useState<any[]>([]);

  useEffect(() => {
    const fetchAmbulances = () => {
      fetch('http://localhost:8080/api/ambulances')
        .then(res => res.json())
        .then(data => setAmbulances(data))
        .catch(err => console.error("Failed to fetch ambulances", err));
    };
    
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{ gridColumn: '1 / -1', borderColor: '#d32f2f' }}>
      <h2 style={{ color: '#f44336' }}>🚑 Emergency Response & Green Corridor</h2>
      <div style={{ marginTop: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
        {ambulances.length === 0 ? (
          <p style={{ color: '#666' }}>No active emergency vehicles tracked.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {ambulances.map((amb, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid #d32f2f', borderRadius: '8px', backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#ffc107' }}>Ambulance Detected (via YOLO26)</h3>
                  <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{new Date(amb.trafficEvent.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '1rem', gap: '1rem' }}>
                  <div>
                    <p><strong>Direction:</strong> {amb.direction || 'UNKNOWN'}</p>
                    <p><strong>ETA to Junction:</strong> <span style={{ color: '#f44336', fontWeight: 'bold' }}>{amb.etaSeconds} sec</span></p>
                    <p><strong>AI Confidence:</strong> {(amb.trafficEvent.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }}><strong>Green Corridor Status:</strong></p>
                    <div style={{ 
                      display: 'inline-block', 
                      marginTop: '5px',
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      backgroundColor: amb.greenCorridorStatus === 'APPROVED_SIMULATED' ? '#4caf50' : '#ff9800',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {amb.greenCorridorStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  {amb.trafficEvent.evidencePath && (
                    <a href={`http://localhost:8000${amb.trafficEvent.evidencePath}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                      View Camera Feed
                    </a>
                  )}
                  {amb.greenCorridorStatus === 'REQUIRES_HUMAN_REVIEW' && (
                    <button style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Manual Override: Approve Corridor
                    </button>
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
