import React, { useEffect, useRef, useState } from "react";

function App() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null); // Ref for MediaRecorder
    const audioChunksRef = useRef([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        async function setupWebcam() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;

                await fetchHistory();


            } catch (error) {
                console.error("Error accessing webcam: ", error);
            }
        }

        setupWebcam();
    }, []);

    const fetchHistory = async () => {
        const uuid = document.cookie.split("=")[1];
        console.log(uuid);

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        };

        try {
            const response = await fetch(
                "http://localhost:5000/history",
                options
            );
            const json = await response.json();
            console.log(json);

            const history = json.history;
            // for each message, if it is a user message, set the role to user
            history.forEach((message) => {
                if (message.role === "user") {
                    message.user = "User";
                    // look at the message content and split it into emotion and message
                    const split = message.content.split(":");
                    message.content = split[1];
                } else {
                    message.user = "System";
                }
            });

            console.log(history)
            setChats(history);
        } catch (error) {
            console.error("Error fetching chat history: ", error);
        }
    }

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
                        { user: "User", message: json.transcription },
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
            setIsRecording(true);
            console.log("Recording started");
        } catch (error) {
            console.error("Error accessing microphone: ", error);
        }
    };

    const handleStop = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // recorder.stop()
            setIsRecording(false);
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
        <div className="bg-dark p-7">
            <div className="mx-auto md:flex">
                <div className="w-full md:w-1/2 my-auto">
                    <video
                        className="mx-auto w-3/4 aspect-4/3 rounded-xl border-black border-2"
                        ref={videoRef}
                        id="video"
                        autoPlay></video>
                    <div
                        {...(isRecording
                            ? {
                                  className:
                                      "mx-auto my-2 w-fit text-red-500 animate-pulse",
                              }
                            : { className: "hidden" })}>
                        <i className="fa-solid fa-video pr-1"></i>
                    </div>
                    <div className="mx-auto my-2 w-fit">
                        <button
                            className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                            onClick={handleRecord}>
                            <i className="fa-solid fa-microphone-lines pr-1"></i>
                            Record
                        </button>
                        <button
                            className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                            onClick={handleStop}>
                            <i className="fa-solid fa-stop pr-1"></i>
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
                            <i className="fa-solid fa-play pr-1"></i>
                            Play Last Recording
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <h1 className="mx-auto text-5xl text-accent text-center">
                        <i className="fa-solid fa-comments pr-1"></i>
                        Chat
                    </h1>
                    <div className="mx-auto my-2 mt-5 w-full px-2 rounded-xl md:max-h-[700px] md:overflow-y-scroll">
                        {chats.map((chat, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between my-4">
                                <div className="text-[#F8F4E3] text-3xl w-[5%]">
                                    {chat.user === "User" || chat.role === "user" ? (
                                        <i className="fa-solid fa-user"></i>
                                    ) : (
                                        <i className="fa-solid fa-robot"></i>
                                    )}
                                </div>

                                <div className="w-[90%]">
                                    <p className={
                                      chat.user === "User" ? "text-secondary" :
                                      "text-[#F8F4E3]"}>
                                        {chat.message || chat.content}
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
