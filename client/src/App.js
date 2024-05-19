import React, { useEffect, useRef, useState } from 'react';

function App() {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    async function setupWebcam() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    }

    setupWebcam();
  }, []);

  const handleRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setAudioChunks([]);
    recorder.ondataavailable = event => setAudioChunks(prev => [...prev, event.data]);
    recorder.start();
    setMediaRecorder(recorder);
  };

  const handleStop = async () => {
    mediaRecorder.stop();
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const image = captureImage();

    const data = { audio: audioBlob, image };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    const response = await fetch('http://localhost:5000/advice', options);
    const json = await response.json();
    console.log(json);
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay></video>
      <div>
        <button onClick={handleRecord}>Record</button>
        <button onClick={handleStop}>Stop</button>
      </div>
      <div id="audio"></div>
    </div>
  );
}

export default App;
