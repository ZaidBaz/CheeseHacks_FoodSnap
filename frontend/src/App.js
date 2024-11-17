import React, { useState } from 'react';
import './App.css'; // Link the CSS file

function App() {
  const [photo, setPhoto] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    setPhoto(file);
  };

  const handleUpload = async () => {
    if (!photo) {
      alert('Upload a photo');
      return;
    }

    const formData = new FormData();
    formData.append('file', photo);

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error during detection');
      }

      const data = await response.json();
      setResults(data || []);
      console.log(results);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Nutrition Information</h1>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="upload-input"
        />
        <button onClick={handleUpload} className="upload-button">
          {loading ? 'Processing...' : 'Upload to Detect'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="results-section">
          <h2>Nutrition Details:</h2>
          <ul className="results-list">
            {results.map((item, index) => (
              <li key={index} className="result-item">
                <strong>{item.Food}</strong>
                <p>Quantity: {item.Quantity}</p>
                <p>Total Calories: {item.Calories}</p>
                <p>Total Carbohydrates: {item.Carbohydrate}</p>
                <p>Total Fiber: {item.Fiber}</p>
                <p>Total Protein: {item.Protein}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;