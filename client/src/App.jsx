import React, { useEffect, useRef, useState } from "react";
import { CobraWorker } from '@picovoice/cobra-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

function App() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null); // Ref for MediaRecorder
    const audioChunksRef = useRef([]);
    const cobraRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [chats, setChats] = useState([]);
    const [assistantMessages, setAssistantMessages] = useState([]);

    let voiceProbability = 0;
    let counter = 0;
    let wasTalking = false;

    function voiceProbabilityCallback(vp) {
        voiceProbability = vp;
    }

    function writeMessage(message) {
        console.log(message);
    }

    async function startCobra(accessKey) {
        writeMessage("Cobra is loading. Please wait...");
        try {
            cobraRef.current = await CobraWorker.create(
                accessKey,
                voiceProbabilityCallback
            );
        } catch (error) {
            writeMessage(error);
            throw new Error(error);
        }
        writeMessage("Cobra worker ready!");

        writeMessage(
            "WebVoiceProcessor initializing. Microphone permissions requested ..."
        );

        try {
            WebVoiceProcessor.subscribe(cobraRef.current);
            writeMessage("WebVoiceProcessor ready and listening!");
        } catch (e) {
            writeMessage("WebVoiceProcessor failed to initialize: " + e);
        }
    }

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

    const handleSpeechPause = async () => {
        console.log("Detected pause in speech");
        console.log(audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
        });
        setAudioUrl(URL.createObjectURL(audioBlob));

        audioChunksRef.current = [];

        const image = captureImage();
        const audio = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(audioBlob);
        });
        console.log("audioBlob:", audioBlob);

        const uuid = document.cookie.split("=")[1];
        console.log(uuid);

        console.log(audio);
        const data = {
            image: image,
            audio: audio,
        };

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

            if (response.status === 400) {
                console.error("Error sending audio data to server: ", json.error);
                audioChunksRef.current = [];
                setWaitingForResponse(false);
                handleRecord();
                return;
            }
            console.log(json);

            const speech = new SpeechSynthesisUtterance();
            const emotion = json.response;
            speech.text = emotion;

            speechSynthesis.speak(speech);

            speech.onend = () => {
                console.log("Stopped reading response");
                setWaitingForResponse(false);
                handleRecord();
            };

            setChats((prevChats) => [
                ...prevChats,
                { user: "User", message: json.transcription },
                { user: "System", message: emotion },
            ]);

            console.log(chats);

            document.cookie = `uuid=${json.uuid}; max-age=36000; path=/`;
        } catch (e) {
            console.error("Error sending audio data to server: ", e);
        }
    };

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
            history.forEach((message) => {
                if (message.role === "user") {
                    message.user = "User";
                    const split = message.content.split(":");
                    message.content = split[1];
                } else {
                    message.user = "System";
                }
            });

            console.log(history);
            setChats(history);
        } catch (error) {
            console.error("Error fetching chat history: ", error);
        }
    };

    const handleRecord = async () => {
        try {
            startCobra('RhTUtHaCMwcEl4t8nk6UnJC0Jgt9u3Cdpy7+lpp1Don2Cil5i0fHtQ==');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (waitingForResponse) {
                    return;
                }

                audioChunksRef.current.push(event.data);
                if (voiceProbability > 0.4) {
                    console.log("Recording audio chunk");
                    console.log(audioChunksRef.current);
                    wasTalking = true;
                    console.log("Speech detected!");
                    counter = 0;
                } else {
                    counter += 1;
                    if (counter > 5) {
                        if (wasTalking && audioChunksRef.current.length >= 5) {
                            setWaitingForResponse(true);
                            handleStop();
                            counter = 0;
                            console.log("Stopped talking");
                            wasTalking = false;
                            handleSpeechPause();
                        }
                        audioChunksRef.current = [];
                    }
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                setIsDisabled(false);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start(500);
            setIsRecording(true);
            console.log("Recording started");
        } catch (error) {
            console.error("Error accessing microphone: ", error);
        }
    };

    const handleStop = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            console.log("Recording stopped");
        }
        if (cobraRef.current) {
            console.log("Stopping cobra");
            cobraRef.current.release();
        }

        audioChunksRef.current = [];
    };

    const handlePlayRecording = () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    const handlePlayEverything = async () => {
        try {
            const response = await fetch('http://localhost:5000/queryVoicesAndAI', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const result = await response.json();
            const { responseData } = result;
            setAssistantMessages(responseData);

            const playAudioAndSpeech = async (item) => {
                return new Promise(async (resolve, reject) => {
                    console.log(item);
                    const audio = new Audio(`data:audio/wav;base64,${item.audioBuffer}`);
                    console.log("audio:", audio);
                    audio.onended = async () => {
                        if (item.messages.length > 0) {
                            const speech = new SpeechSynthesisUtterance(item.messages.join(' '));
                            speech.onend = () => resolve();
                            speech.onerror = () => reject('Speech synthesis failed');
                            speechSynthesis.speak(speech);
                        } else {
                            resolve();
                        }
                    };
                    audio.onerror = () => reject('Audio playback failed');
                    audio.play();
                });
            };

            for (const item of responseData) {
                await playAudioAndSpeech(item);
            }
        } catch (error) {
            console.error('Error fetching assistant messages: ', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch('http://localhost:5000/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            console.log(response);
            setChats([]);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting the chat:', error);
        }
    };

    const handleSummarize = async () => {
        console.log('response');

        try {
            const response = await fetch('http://localhost:5000/summarizeChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            console.log(response);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.summary) {
                const speech = new SpeechSynthesisUtterance(data.summary);
                speech.onend = () => console.log("Finished reading the summary.");
                speech.onerror = (event) => console.error('Speech synthesis failed:', event.error);
                speechSynthesis.speak(speech);
            } else {
                console.log('No summary provided.');
            }
        } catch (error) {
            console.error('Error summarizing the chat:', error);
        }
    };

    const captureImage = () => {
        const canvas = document.createElement("canvas");
        if (!videoRef.current) {
            return;
        }
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg");
    };

    return (
        <div className="bg-dark p-7">
            <h1 className="text-5xl font-bold text-center text-accent mb-8">AI Need Help</h1>
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
                    <div className="mx-auto my-2 w-fit flex flex-col items-center justify-center">
                        <div className="flex">
                            <button
                                className={`inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] ${isRecording ? 'bg-red-500' : 'bg-secondary/10'} hover:bg-secondary/20 rounded-full`}
                                onClick={handleRecord}>
                                <i className="fa-solid fa-microphone-lines pr-1"></i>
                                Record
                            </button>
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handleStop}>
                                <i className="fa-solid fa-stop pr-1"></i>
                                Stop Recording
                            </button>
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handlePlayRecording}>
                                <i className="fa-solid fa-play pr-1"></i>
                                Play Last Recording
                            </button>
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handlePlayEverything}>
                                <i className="fa-solid fa-play pr-1"></i>
                                Play Full Conversation
                            </button>
                        </div>
                        <div className="flex">
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handleSummarize}>
                                <i className="fa-solid fa-print pr-1"></i>
                                Summarize Conversation
                            </button>
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handleDelete}>
                                <i className="fa-solid fa-trash pr-1"></i>
                                Clear History
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 border-2 border-white rounded pt-4 pb-0">
                    <h1 className="mx-auto text-5xl text-accent text-center">
                        <i className="fa-solid fa-comments pr-1"></i>
                        Chat
                    </h1>
                    <div className="mx-auto my-2 mt-5 w-full px-2 rounded-xl max-h-[60vh] overflow-y-scroll scrollbar scrollbar-thumb-white scrollbar-track-white">
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
