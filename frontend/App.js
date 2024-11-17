import React, { useState } from 'react';

function App() {
  const [photo, setPhoto] = useState(null); // Selected photo
  const [items, setItems] = useState([]); // List of items from backend
  const [loading, setLoading] = useState(false); // Loading state

  // Handle file selection
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    setPhoto(file);
  };

  // Upload photo and fetch results
  const handleUpload = async () => {
    if (!photo) {
      alert('Please select a photo to upload!');
      return;
    }

    const formData = new FormData();
    formData.append('image', photo);

    setLoading(true);
    try {
      // Simulate backend response delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response: Replace with actual backend fetch
      const mockResponse = [
        { name: "Item 1", calories: "200 kcal", fats: "10g", sugars: "15g" },
        { name: "Item 2", calories: "150 kcal", fats: "8g", sugars: "10g" },
        { name: "Item 3", calories: "300 kcal", fats: "12g", sugars: "20g" },
      ];

      setItems(mockResponse); // Set items in state
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Nutrition Information Detection</h1>
      <input type="file" accept="image/*" onChange={handlePhotoChange} />
      <br />
      <button onClick={handleUpload} style={{ marginTop: '10px' }}>
        {loading ? 'Processing...' : 'Upload and Detect'}
      </button>
      {/* Display the list of items */}
      {items.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Nutrition Details:</h2>
          <ul>
            {items.map((item, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>{item.name}</strong>
                <p>Calories: {item.calories}</p>
                <p>Fats: {item.fats}</p>
                <p>Sugars: {item.sugars}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
