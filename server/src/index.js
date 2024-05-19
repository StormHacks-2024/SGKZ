
import express from 'express';
import dotenv from 'dotenv';
import { captureAndAnalyze } from './emotionDetection.js';
import {Open} from './Open.js';


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
	res.json(await open.chat());
})

// will recieve an image from the client
app.post('/advice', async (req, res) => {
	const { image, audio } = req.body; // base64 image
	const emotion = await captureAndAnalyze(image);
	res.json({ emotion });
})

app.listen(PORT, () => {
	  console.log(`Server is running on port ${PORT}`);

	  // print full address sever
	  console.log(`http://localhost:${PORT}`);
})


// New endpoint to pass user content to chat method
app.post('/chat', async (req, res) => {
	const { content } = req.body; // Get content from request body
	try {
	  const response = await open.chat(content);
	  res.json({ response });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
});
  //

setInterval(() => {
	  captureAndAnalyze();
}, 5000);
// testing