
import express from 'express';
import dotenv from 'dotenv';
import { captureAndAnalyze } from './emotionDetection.js';
import { Open } from './Open.js';
import fs from 'fs';
import { getUUIDFromCookie } from './utils.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const { default:VAD } = await import('node-vad');

import { WebSocketServer } from 'ws';


const vad = new VAD(VAD.Mode.NORMAL);


dotenv.config();
const PORT = process.env.PORT || 5000;
const open = new Open();

const app = express();
app.use(cookieParser());

// change POST request max size
app.use(express.json({ limit: '512mb' }));

app.use(express.urlencoded({ extended: true }));
app.use(cors({
	origin: 'http://localhost:3000', // set the allowed origin to your client's address
	credentials: true, // allow credentials
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed methods
	allowedHeaders: ['Content-Type'] // allowed headers
  }));

app.get('/', async (req, res) => {
	res.send('Hello World');
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);

	// print full address sever
	console.log(`http://localhost:${PORT}`);
})

app.post('/chat', async (req, res) => {
	const uuid = getUUIDFromCookie(req);
	console.log(uuid);
	const { image, audio } = req.body; // Get content from request body
	try {
		const base64Audio = audio.replace(/^data:audio\/webm;base64,/, "");
		const audioBuffer = Buffer.from(base64Audio, 'base64');
		const audioPath = 'audio.webm';
    	fs.writeFileSync(audioPath, audioBuffer);
		const audioStream = fs.createReadStream(audioPath);
		const transcription = await open.transcribeAudio(audioStream);
		console.log(transcription);

		const emotion = await captureAndAnalyze(image);

		const content = `${transcription} \n ${emotion}`;
		const response = await open.chat(content);
		res.cookie('uuid', uuid);
		res.json({ response, uuid });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
//

const wss = new WebSocketServer({ port: 1234 });

const CHUNK_SIZE = 8736;  // Define a manageable chunk size
let bufferState = Buffer.alloc(0);wss.on('connection', (ws) => {
	ws.on('message', (message) => {
	  if (Buffer.isBuffer(message)) {
		// Combine the new message with any remaining data from the previous chunk
		bufferState = Buffer.concat([bufferState, message]);
  
		while (bufferState.length >= CHUNK_SIZE) {
		  const chunk = bufferState.slice(0, CHUNK_SIZE);
		  bufferState = bufferState.slice(CHUNK_SIZE);
  
		  try {
			const floatBuffer = vad.toFloatBuffer(chunk);
			vad.processAudio(floatBuffer, 16000)
			  .then((res) => {
				console.log('VAD result:', res);
			  })
			  .catch((err) => {
				console.error('Error processing audio:', err);
			  });
		  } catch (err) {
			console.error('Error in VAD processing:', err);
		  }
		}
	  } else {
		console.error('Received message is not a buffer');
	  }
	});
  });
wss.on('close', () => {
	console.log('Client disconnected');
});

console.log('WebSocket server running on ws://localhost:1234');

// setInterval(() => {
// 	captureAndAnalyze();
// }, 5000);
// testing