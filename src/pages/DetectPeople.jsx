import { useRef, useEffect, useState } from 'react';
import '../../src/App.css';
import * as faceapi from 'face-api.js';
import axios from 'axios';

function DetectPeople() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detectedName, setDetectedName] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [data, setData] = useState({
    Name: 'unknown',
    StudentID: 'unknown',
    Section: 'unknown'
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels();
    startVideo();

    return () => {
      clearCanvas();
      window.removeEventListener('resize', handleResize);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
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
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setVideoLoaded(true);
          };
        })
        .catch((error) => {
          setError(`Error accessing webcam: ${error.message}`);
        });
    }
    window.addEventListener('resize', handleResize);
  };
  

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),

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

    const detectInterval = setInterval(async () => {
      const videoElement = videoRef.current;
      if (!videoElement || !modelsLoaded || !videoLoaded) {
        return;
      }

      const detections = await faceapi.detectAllFaces(videoElement, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors();
      const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const canvas = canvasRef.current;
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

    videoRef.current.addEventListener('pause', () => {
      clearInterval(detectInterval);
    });

    return () => {
      clearInterval(detectInterval);
    };
  };

 const loadLabeledImages = async () => {
  const labels = ['Hamza Khalid',"Hamza"];
  try {
    const labeledDescriptors = await Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 3; i++) {
          const imagePath = `server/src/labeled_images/${label}/${i}.jpg`;
          console.log(`Loading image: ${imagePath}`);
          try {
            const img = await faceapi.fetchImage(imagePath);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detections) {
              descriptions.push(detections.descriptor);
            } else {
              console.warn(`No face detected in ${imagePath}`);
              // You can skip this image or handle it in some way
              // For example, push a default descriptor or skip adding to descriptions array
            }
          } catch (error) {
            console.error(`Error processing ${imagePath}: ${error.message}`);
            // Handle specific errors related to image loading or face detection
            // You may want to skip the image entirely or provide a default descriptor
          }
        }
        // Ensure descriptions array is not empty before creating LabeledFaceDescriptors
        if (descriptions.length > 0) {
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        } else {
          console.warn(`No valid descriptors found for ${label}. Skipping.`);
          return null; // Return null or handle this case based on your application's needs
        }
      })
    );

    // Filter out null values (if any) from labeledDescriptors array
    const filteredDescriptors = labeledDescriptors.filter(descriptor => descriptor !== null);

    // Ensure we log the filteredDescriptors to verify what's being loaded
    console.log("Labeled Descriptors:", filteredDescriptors);

    return filteredDescriptors;
  } catch (error) {
    console.error(`Error loading labeled images: ${error.message}`);
    throw error; // Rethrow the error to indicate failure in loading labeled images
  }
};


  const handleDetection = async () => {
    if (!detectedName) return;
    console.log(detectedName)

    const cleanedName = detectedName.replace(/[^a-zA-Z ]/g, ''); // Remove all non-alphabetic characters and spaces
    const fullName = cleanedName.split(' ')[0] +" "+ cleanedName.split(' ')[1] ; // Split the cleaned name and take the first word

    console.log(fullName); // Outputs: John


    console.log()
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className='detect_container'>
      {data && (
        <div className='card'>
          <h2>Person Detected</h2>
          <div className='image-container'>
            <img src={`server/src/labeled_images/${data.Name}/1.jpg`} alt="Person" className='image' />
          </div>
          <div className='field'>
            <span className='label'>Name:</span> {data.Name}
          </div>
          <div className='field'>
            <span className='label'>Student ID:</span> {data.ID}
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
      </div>
    </div>
  );
}

export default DetectPeople;
