import React, { useEffect, useRef, useState } from "react";

function App() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null); // Ref for MediaRecorder
    const audioChunksRef = useRef([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        async function setupWebcam() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;

            } catch (error) {
                console.error("Error accessing webcam: ", error);
            }
        }

        setupWebcam();
    }, []);

    const handleRecord = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            // setAudioChunks([]); // Clear previous chunks
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            mediaRecorderRef.current.ondataavailable = (event) => {
                console.log(event.data);
                // console.log(audioChunks)
                // setAudioChunks(prev => [...prev, event.data]);
                audioChunksRef.current.push(event.data);
                console.log(audioChunksRef.current);
            };

            mediaRecorderRef.current.onstop = async () => {
                console.log("Recorder stopped");
                console.log("chunks:", audioChunksRef.current.length);
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                setAudioUrl(URL.createObjectURL(audioBlob));
                setIsDisabled(false);

                // Stop the audio stream
                stream.getTracks().forEach((track) => track.stop());

                const image = captureImage();
                // convert audioBlob to base64
                const audio = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(audioBlob);
                });
                console.log("audioBlob:", audioBlob);

                const uuid = document.cookie.split("=")[1];
                console.log(uuid);

                const data = {
                    image: image,
                    audio: audio,
                };

                // send the cookie and data to the server
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                    credentials: "include",
                };

                try {
                    const response = await fetch(
                        "http://localhost:5000/chat",
                        options
                    );
                    const json = await response.json();
                    console.log(json);

                    const speech = new SpeechSynthesisUtterance();
                    const emotion = json.response;
                    speech.text = emotion;

                    speechSynthesis.speak(speech);

                    // Add the chat to the chat list
                    setChats((prevChats) => [
                        ...prevChats,
                        { user: "System", message: emotion },
                    ]);

                    // save cookie
                    document.cookie = `uuid=${json.uuid}; max-age=36000; path=/`;
                } catch (error) {
                    console.error(
                        "Error sending audio data to server: ",
                        error
                    );
                }
            };

            mediaRecorderRef.current.start(500);
            // Store the recorder in the ref
            console.log("Recording started");
        } catch (error) {
            console.error("Error accessing microphone: ", error);
        }
    };

    const handleStop = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // recorder.stop()
            console.log("Recording stopped");
        }
    };

    const handlePlayRecording = () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    const captureImage = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg");
    };

    return (
        <div className="bg-dark p-4">
            <div className="mx-auto flex">
                <div className="w-1/2">
                    <video
                        className="mx-auto w-[640px] h-[480px] rounded-lg border-black border-2"
                        ref={videoRef}
                        id="video"
                        width="640"
                        height="480"
                        autoPlay></video>
                    <div className="mx-auto my-2 w-fit">
                        <button
                            className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                            onClick={handleRecord}>
                            Record
                        </button>
                        <button
                            className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                            onClick={handleStop}>
                            Stop
                        </button>
                        <button
                            className={
                                isDisabled
                                    ? "inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 rounded-full"
                                    : "inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                            }
                            onClick={handlePlayRecording}
                            disabled={isDisabled}>
                            Play Recording
                        </button>
                    </div>
                </div>
                <div className="w-1/2">
                    <h1 className="mx-auto text-4xl text-accent text-center">
                        Chat
                    </h1>
                    <div className="mx-auto my-2 w-full">
                        {chats.map((chat, index) => (
                            <div key={index} className="flex items-center justify-start my-2">
                                <div>
                                    <img
                                        src="https://via.placeholder.com/150"
                                        alt={chat.user}
                                        className="w-16 h-16 rounded-full"
                                    />
                                </div>

                                <div className="ml-4">
                                    <p className="text-[#F8F4E3]">
                                        {chat.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
