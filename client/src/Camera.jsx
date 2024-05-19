function Camera() {
    // const recordButton = document.getElementById("record");
    // const stopButton = document.getElementById("stop");
    // const playButton = document.getElementById("play");
    // const audioElement = document.getElementById("audio");
    // const audioChunks = [];
    // let mediaRecorder;
    // let audioUrl;

    // recordButton?.addEventListener("click", async () => {
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //     });
    //     const options = { mimeType: "audio/webm" };
    //     mediaRecorder = new MediaRecorder(stream, options);
    //     audioChunks.length = 0;

    //     mediaRecorder.addEventListener("dataavailable", (event) => {
    //         audioChunks.push(event.data);
    //     });

    //     mediaRecorder.start();
    // });

    // stopButton?.addEventListener("click", async () => {
    //     if (mediaRecorder && mediaRecorder.state !== "inactive") {
    //         mediaRecorder.stop();
    //         mediaRecorder.addEventListener("stop", async () => {
    //             const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    //             audioUrl = URL.createObjectURL(audioBlob);
    //             playButton.disabled = false;

    //             const image = captureImage();
    //             await sendData(audioBlob, image);
    //         });
    //     }
    // });

    // // Function to play the recorded audio
    // playButton?.addEventListener("click", () => {
    //     const audio = new Audio(audioUrl);
    //     audio.play();
    // });

	// const setupWebcam = async () => {
	// 	const video = document.getElementById('video');
	// 	const stream = await navigator.mediaDevices.getUserMedia({ video: true });
	// 	if(video)
	// 		video.srcObject = stream;
	// }

	// const captureImage = () => {
	// 	const video = document.getElementById('video');
	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = video.videoWidth;
	// 	canvas.height = video.videoHeight;
	// 	const context = canvas.getContext('2d');
	// 	context.drawImage(video, 0, 0, canvas.width, canvas.height);
	// 	return canvas.toDataURL('image/jpeg');
	// }

	// const sendData = async (audioBlob, image) => {
	// 	const data = {
	// 	  audio: await blobToBase64(audioBlob),
	// 	  image
	// 	};
	// 	const options = {
	// 	  method: 'POST',
	// 	  headers: {
	// 		'Content-Type': 'application/json'
	// 	  },
	// 	  body: JSON.stringify(data)
	// 	};
  
	// 	const response = await fetch('http://localhost:5000/chat', options);
	// 	const json = await response.json();
	// 	console.log(json);
  
	// 	const speech = new SpeechSynthesisUtterance()
	// 	const emotion = json.response
	// 	speech.text = emotion;
  
	// 	speechSynthesis.speak(speech)
	// }

	// const blobToBase64 = (blob) => {
	// 	return new Promise((resolve, reject) => {
	// 	  const reader = new FileReader();
	// 	  reader.onloadend = () => resolve(reader.result);
	// 	  reader.onerror = reject;
	// 	  reader.readAsDataURL(blob);
	// 	});
	// }

	// setupWebcam();

    return (
        <div>
            <video className="w-[640px] h-[480px]" id="video" width="640" height="480" autoPlay></video>
            <div>
                <button id="record">Record</button>
                <button id="stop">Stop</button>
                <button id="play" disabled>
                    Play Recording
                </button>
            </div>

            <div id="audio"></div>
        </div>
    );
}

export default Camera;
