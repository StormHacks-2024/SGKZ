
import express from 'express';
import dotenv from 'dotenv';
import { captureAndAnalyze } from './emotionDetection.js';
import { Open } from './Open.js';
import fs from 'fs';
import { getUUIDFromCookie } from './utils.js';


dotenv.config();
const PORT = process.env.PORT || 5000;
const open = new Open();

const app = express();

// change POST request max size
app.use(express.json({ limit: '512mb' }));

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.get('/', async (req, res) => {
	const uuid = getUUIDFromCookie(req);
	// expect to recieve a base 64 audio string
	// save the audio to a file
	// transcribe the audio

	const {image, audio} = req.body;
	fs.writeFileSync('audio.webm', audio, 'base64');
	const audioStream = fs.createReadStream('audio.webm');

	const transcription = await open.transcribeAudio(audioStream); // expects a stream
	res.json({ transcription });
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);

	// print full address sever
	console.log(`http://localhost:${PORT}`);
})

app.post('/chat', async (req, res) => {
	// const uuid = getUUIDFromCookie(req);
	console.log(req.body);
	console.log(req);
	const { image, audio } = req.body; // Get content from request body
	try {

		console.log(audio);
		const base64Audio = audio.replace(/^data:audio\/webm;base64,/, "");
		const audioBuffer = Buffer.from(base64Audio, 'base64');

		const transcription = await transcribeAudio(audioBuffer);

		const emotion = await captureAndAnalyze(image);


		const content = `${transcription} \n ${emotion}`;
		const response = await open.chat(content);
		res.json({ response });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
	// res.cookie('uuid', uuid);
});
//

setInterval(() => {
	captureAndAnalyze();
}, 5000);
// testing