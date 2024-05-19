
import express from 'express';
import dotenv from 'dotenv';
import { captureAndAnalyze } from './emotionDetection.js';
import {Open} from './Open.js';
import fs from 'fs';


dotenv.config();
const PORT = process.env.PORT || 5000;
const open = new Open();

const app = express();

// fix CORS error
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.get('/', async (req, res) => {
	// expect to recieve a base 64 audio string
	// save the audio to a file
	// transcribe the audio

	// const {image, audio} = req.body;
	// convert audio to a file
	// fs.writeFileSync('audio.wav', audio, 'base64');
	const audio = fs.createReadStream('audio.mp3');

	const transcription = await open.transcribeAudio(audio); // expects a stream
	res.json({ transcription });
})

// will recieve an image from the client
app.post('/advice', async (req, res) => {
	const { image, audio } = req.body; // base64 image, audio is a base64 string


	const emotion = await captureAndAnalyze(image);
	res.json({ emotion });
})

app.listen(PORT, () => {
	  console.log(`Server is running on port ${PORT}`);

	  // print full address sever
	  console.log(`http://localhost:${PORT}`);
})

setInterval(() => {
	  captureAndAnalyze();
}, 5000);
