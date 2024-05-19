import React, { useEffect, useRef, useState } from 'react';

function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null); // Ref for MediaRecorder
  const audioChunksRef = useRef([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing webcam: ', error);
      }
    }

    setupWebcam();
  }, []);

  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // setAudioChunks([]); // Clear previous chunks
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder; 
      mediaRecorderRef.current.ondataavailable = event => {
        console.log(event.data)
        // console.log(audioChunks)
        // setAudioChunks(prev => [...prev, event.data]);
        audioChunksRef.current.push(event.data);
        console.log(audioChunksRef.current)
      };


      mediaRecorderRef.current.onstop = async () => {
        console.log("Recorder stopped")
        console.log("chunks:",audioChunksRef.current.length)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(audioBlob));
        setIsDisabled(false);

        // Stop the audio stream
        stream.getTracks().forEach(track => track.stop());

        const image = captureImage();
        // convert audioBlob to base64
        const audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(audioBlob);
        });
        console.log("audioBlob:",audioBlob)



        const data = {
          image: image,
          audio: audio
        }

        console.log(data);
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        };

        try {
          const response = await fetch('http://localhost:5000/chat', options);
          const json = await response.json();
          console.log(json);

          const speech = new SpeechSynthesisUtterance()
          const emotion = json.response
          speech.text = emotion;
    
          speechSynthesis.speak(speech);
        } catch (error) {
          console.error('Error sending audio data to server: ', error);
        }
      };

      mediaRecorderRef.current.start(500);
      // Store the recorder in the ref
      console.log('Recording started');
    } catch (error) {
      console.error('Error accessing microphone: ', error);
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // recorder.stop()
      console.log('Recording stopped');
    }
  };

  const handlePlayRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
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
        <button onClick={handlePlayRecording} disabled={isDisabled}>Play Recording</button>
      </div>
    </div>
  );
}

export default App;