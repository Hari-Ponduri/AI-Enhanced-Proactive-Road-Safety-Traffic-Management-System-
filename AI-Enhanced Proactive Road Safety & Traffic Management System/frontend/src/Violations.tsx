import { useState, useEffect } from 'react';

export default function Violations() {
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/violations')
      .then(res => res.json())
      .then(data => setViolations(data))
      .catch(err => console.error("Failed to fetch violations", err));
  }, []);

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h2>Simulated e-Challans</h2>
      <div style={{ marginTop: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
        {violations.length === 0 ? (
          <p style={{ color: '#666' }}>No violations detected yet.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Challan ID</th>
                <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Plate</th>
                <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Violation Type</th>
                <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Speed</th>
                <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Fine Amount</th>
                <th style={{ borderBottom: '1px solid #333', padding: '8px' }}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>#CH-{v.id.toString().padStart(4, '0')}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #222', fontWeight: 'bold', color: '#ffb74d' }}>{v.mockLicensePlate}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>{v.violationType}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>
                    {v.speed ? `${v.speed.toFixed(1)} mph` : 'N/A'}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>
                    ${v.violationType === 'OVERSPEED' ? '150.00' : '200.00'}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #222' }}>
                    {v.trafficEvent?.evidencePath ? (
                      <a href={`http://localhost:8000${v.trafficEvent.evidencePath}`} target="_blank" rel="noreferrer" style={{ color: '#4da9ff' }}>
                        View Image
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
  );
}
