import React, { useEffect, useRef, useState } from "react";

import {CobraWorker} from '@picovoice/cobra-web';
import {WebVoiceProcessor} from '@picovoice/web-voice-processor';



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

    let voiceProbability = 0
    let counter = 0
    let wasTalking = false
    function voiceProbabilityCallback(vp) {
      // take action based on voice probability
      voiceProbability = vp
      // console.log(voiceProbability)
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
      console.log("Detected pause in speech")
      console.log(audioChunksRef.current.length)
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      setAudioUrl(URL.createObjectURL(audioBlob));

      audioChunksRef.current = [];

      
      const image = captureImage();
      // convert audioBlob to base64
      const audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(audioBlob);
      });
      // console.log("audioBlob:", audioBlob);

      const uuid = document.cookie.split("=")[1];
      console.log(uuid);
      
      console.log(audio)
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

          if(response.status === 400) {
            console.error("Error sending audio data to server: ", json.error)
            audioChunksRef.current = []
            setWaitingForResponse(false)
            handleRecord()
            return
          }
          console.log(json);

          const speech = new SpeechSynthesisUtterance();
          const emotion = json.response;
          speech.text = emotion;
          

          speechSynthesis.speak(speech);

          speech.onend = () => {
            console.log("Stopped reading response")
            setWaitingForResponse(false)
            handleRecord()
          }

          // Add the chat to the chat list
          setChats((prevChats) => [
              ...prevChats,
              { user: "User", message: json.transcription },
              { user: "System", message: emotion },
          ]);

          console.log(chats)

          // save cookie
          document.cookie = `uuid=${json.uuid}; max-age=36000; path=/`;
      // setIsDisabled(false);
        } catch(e) {
          console.error(
          "Error sending audio data to server: ",
          e
      );
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
            // DANGER REMOVE KEY REMOVE KEY REMOVE KEY
            startCobra('RhTUtHaCMwcEl4t8nk6UnJC0Jgt9u3Cdpy7+lpp1Don2Cil5i0fHtQ==')
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            // setAudioChunks([]); // Clear previous chunks
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            mediaRecorderRef.current.ondataavailable = (event) => {
                if(waitingForResponse) {
                  return
                }
                // console.log(event.data);
                // console.log(audioChunks)
                // setAudioChunks(prev => [...prev, event.data]);
                
                audioChunksRef.current.push(event.data);
                if (voiceProbability > 0.4) {
                  console.log("Recording audio chunk")
                  console.log(audioChunksRef.current);
                  wasTalking = true
                  console.log("Speech detected!")
                  counter = 0
                } else {
                  counter += 1
                  if( counter > 5) {

                    if(wasTalking && audioChunksRef.current.length >= 5) {
                      setWaitingForResponse(true)
                      handleStop();
                      counter = 0
                      console.log("Stopped talking")
                      wasTalking = false
                      
                      handleSpeechPause()
                    }
                    audioChunksRef.current = []
                  }
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                // console.log("Recorder stopped");
                // console.log("chunks:", audioChunksRef.current.length);
                // const audioBlob = new Blob(audioChunksRef.current, {
                //     type: "audio/webm",
                // });
                // setAudioUrl(URL.createObjectURL(audioBlob));
                setIsDisabled(false);

                // Stop the audio stream
                stream.getTracks().forEach((track) => track.stop());
                
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
        if(cobraRef.current) {
          console.log("Stopping cobra")
          cobraRef.current.release()
        }
        
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



            // Function to play the audio and then the speech
            const playAudioAndSpeech = async (item) => {
                return new Promise(async (resolve, reject) => {

                    console.log(item);
                    // Create and play the audio element
                    const audio = new Audio(`data:audio/wav;base64,${item.audioBuffer}`);
                    console.log("audio:", audio);
                    audio.onended = async () => {
                        // Once audio ends, check if there are messages
                        if (item.messages.length > 0) {
                            const speech = new SpeechSynthesisUtterance(item.messages.join(' '));
                            speech.onend = () => resolve(); // Resolve the promise when speech ends
                            speech.onerror = () => reject('Speech synthesis failed'); // Reject on speech error
                            speechSynthesis.speak(speech);
                        } else {
                            resolve(); // Resolve the promise immediately if no messages
                        }
                    };
                    audio.onerror = () => reject('Audio playback failed'); // Reject on audio error
                    audio.play();
                });
            };

            // Sequentially play each audio and speech synthesis
            for (const item of responseData) {
                await playAudioAndSpeech(item); // Wait for one audio and its speech to complete before the next
            }
        } catch (error) {
            console.error('Error fetching assistant messages: ', error);
        }
    };

    const handleSummarize = async () => {
        console.log('response')

        try {
            // Send a POST request to the server with the UUID of the chat session
            const response = await fetch('http://localhost:5000/summarizeChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            console.log(response)
    
            if (!response.ok) {
                // Handle responses that are not 2xx
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json(); // Parsing the JSON response body
    
            // Check if there's a summary to read
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
        if(!videoRef.current) {
          return
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
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handlePlayRecording}>
                                <i className="fa-solid fa-stop pr-1"></i>
                                Play Last Recording
                            </button>
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handlePlayEverything}>
                                <i className="fa-solid fa-microphone-lines pr-1"></i>
                                Play Full Conversation
                            </button>
                            <button
                                className="inline-flex items-center justify-center px-3 py-1 mr-2 my-2 text-sm font-medium leading-5 text-[#F8F4E3] bg-secondary/10 hover:bg-secondary/20 rounded-full"
                                onClick={handleSummarize}>
                                <i className="fa-solid fa-microphone-lines pr-1"></i>
                                Summerize Performance
                            </button>
                        </div>
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
                                Stop
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
                                {console.log(chat)}
                                <div className="w-[90%]">
                                    <p className={
                                        chat.user === "User" ? "text-secondary" :
                                            "text-[#F8F4E3]"}>
                                        {chat.message || chat.content}
                                    </p>
                                </div>
                            </div>
                        ))
                      }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
