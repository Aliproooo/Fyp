import { useRef, useEffect, useState } from 'react';
import '../../src/App.css';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { formControlLabelClasses } from '@mui/material';

function DetectPeople() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detectedName, setDetectedName] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [nameStored, setNameStored] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    loadModels();
    startVideo();

    // Cleanup function to remove event listeners and intervals
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && videoLoaded) {
      initializeCanvas();
      faceMyDetect();
    }
  }, [modelsLoaded, videoLoaded]);

  const startVideo = () => {
    if (videoRef.current) {
      videoRef.current.src = "/src/khuzaima.mp4";
      videoRef.current.onloadedmetadata = () => {
        setVideoLoaded(true);
      };
      videoRef.current.onerror = (e) => {
        setError(`Error loading video: ${e.target.error.message}`);
      };
    }
    window.addEventListener('resize', handleResize);
  };

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(() => {
      setModelsLoaded(true);
    }).catch((err) => {
      setError(`Error loading models: ${err.message}`);
    });
  };

  const initializeCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
    }
  };

  const faceMyDetect = async () => {
    const labeledDescriptors = await loadLabeledImages().catch((err) => {
      setError(`Error loading labeled images: ${err.message}`);
    });

    if (!labeledDescriptors) return;

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

    videoRef.current.addEventListener('play', () => {
      const canvas = canvasRef.current;
      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const detectInterval = setInterval(async () => {
        const videoElement = videoRef.current;
        if (!videoElement || !modelsLoaded || !videoLoaded) {
          return;
        }

        const detections = await faceapi.detectAllFaces(videoElement, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        if (results.length > 0) {
          const name = results[0].toString();
        
          
          setDetectedName(name);
        }

        results.forEach((result, i) => {
          const name = result.toString();
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: name });
          drawBox.draw(canvas);
       
        });
      }, 100);
      



      // Cleanup function to clear detectInterval
      return () => {
        clearInterval(detectInterval);
      };
    });
  };

  const loadLabeledImages = () => {
    const labels = ['Prashant Kumar', 'Captain America', 'Tony Stark', 'Muhammad Hamza Khalid', 'Khuzaima Ansari'];
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`/src/labeled_images/${label}/${i}.jpg`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

 const handleDetection = async () => {
  if (!detectedName) return;
  const fullName = detectedName.split(' ')[0] + ' ' + detectedName.split(' ')[1];
  videoRef.current.pause();

 
  try {
    const response = await axios.get(`http://localhost:5000/api/getPersonDetails`, {
      params: {
        name: fullName
      }
    });

    setData(response.data);
  } catch (error) {
    console.error('Error fetching person details:', error);
    setError('Error fetching person details');
  }
};

   const handleResize = () => {
    initializeCanvas();
  };

  return (
    <div className='detect_container'>
      {data && (
        <div className='card'>
          <h2>Person Detected</h2>
          <div className='image-container'>
            <img src={`src/labeled_images/${data.Name}/1.jpg`} alt="Person" className='image' />
          </div>
          <div className='field'>
            <span className='label'>Name:</span> {data.Name}
          </div>
          <div className='field'>
            <span className='label'>Student ID:</span> {data.StudentID}
          </div>
          <div className='field'>
            <span className='label'>Section:</span> {data.Section}
          </div>
        </div>
      )}
      <div className="myapp">
        <h1 className='detect_h1'>Your Face is being detected</h1>
        {error && <p>Error: {error}</p>}
        <div className="appvideo">
          <video ref={videoRef} autoPlay muted width="940" height="650"></video>
          <canvas ref={canvasRef} className="appcanvas" />
        </div>
        <button onClick={handleDetection} disabled={!detectedName}>Confirm Detection</button>
        {nameStored && <p>Detection stored successfully!</p>}
      
      </div>
    </div>
  );
}

export default DetectPeople;