import React, { useState } from 'react';

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const [uploadType, setUploadType] = useState('traffic');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = uploadType === 'traffic' 
        ? 'http://localhost:8000/api/video/upload' 
        : 'http://localhost:8000/api/video/upload/driver';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (response.ok) {
        setMessage(`Upload successful. Processing ${result.filename}...`);
      } else {
        setMessage('Upload failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error connecting to AI service.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h2>Video Upload & Processing</h2>
      <div style={{ marginTop: '1rem', padding: '2rem', border: '2px dashed #333', borderRadius: '8px', textAlign: 'center' }}>
        <input 
          type="file" 
          accept="video/mp4,video/avi,video/quicktime" 
          onChange={handleFileChange} 
          style={{ marginBottom: '1rem' }} 
        />
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem' }}>
            <input type="radio" value="traffic" checked={uploadType === 'traffic'} onChange={(e) => setUploadType(e.target.value)} /> External Traffic Feed
          </label>
          <label>
            <input type="radio" value="driver" checked={uploadType === 'driver'} onChange={(e) => setUploadType(e.target.value)} /> Internal Driver Camera
          </label>
        </div>
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: file && !uploading ? '#4caf50' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: file && !uploading ? 'pointer' : 'not-allowed'
          }}
        >
          {uploading ? 'Uploading...' : 'Process Video'}
        </button>
        {message && <p style={{ marginTop: '1rem', color: '#4caf50' }}>{message}</p>}
      </div>
    </div>
  );
}
