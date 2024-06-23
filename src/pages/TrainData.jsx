import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const TrainData = () => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [section, setSection] = useState('');
  const [type, setType] = useState('');
  const [images, setImages] = useState([]);
  const webcamRef = useRef(null);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImages((prevImages) => [...prevImages, imageSrc]);
  }, [webcamRef]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    images.forEach((image, index) => {
      const byteString = atob(image.split(',')[1]);
      const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }
      const file = new Blob([arrayBuffer], { type: mimeString });
      formData.append('images', file, `${index + 1}.jpg`);
    });

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images', error);
    }

    // Reset form
    setName('');
    setId('');
    setSection('');
    setType('');
    setImages([]);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, marginLeft: '300px' }}>
        <h1>Train Data Page</h1>
        <form>
          <div>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>ID:</label>
            <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
          </div>
          <div>
            <label>Section:</label>
            <input type="text" value={section} onChange={(e) => setSection(e.target.value)} />
          </div>
          <div>
            <label>Type:</label>
            <div>
              <input type="radio" value="staff" checked={type === 'staff'} onChange={(e) => setType(e.target.value)} /> Staff
              <input type="radio" value="student" checked={type === 'student'} onChange={(e) => setType(e.target.value)} /> Student
            </div>
          </div>
        </form>
      </div>
      <div style={{ flex: 1 }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
        />
        <button onClick={handleCapture}>Capture Photo</button>
        <button type="button" onClick={handleSubmit}>Submit</button>
        <div>
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Captured ${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainData;
