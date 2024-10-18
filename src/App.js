import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://127.0.0.1:8000/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      setData(response.data.data);
    }).catch((error) => {
      console.error('Error uploading file:', error);
    });
  };

  return (
    <div>
      <h1>Data Type Inference</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>

      {data && (
        <div>
          <h2>Processed Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;