import express from "express";
import dotenv from "dotenv";
import { captureAndAnalyze } from "./emotionDetection.js";
import { Open } from "./Open.js";
import fs from "fs";
import { getUUIDFromCookie } from "./utils.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getChatMessages } from "./mongo.js";

dotenv.config();
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const PORT = process.env.PORT || 5000;
const open = new Open();
const app = express();
app.use(cookieParser());

const cors = {
	origin: ["http://www.aineedhelp.online","http://localhost:3000","https://www.aineedhelp.online"],
	default: "http://localhost:3000"
  }
  
  app.all('*', function(req, res, next) {
	const origin = cors.origin.includes(req.header('origin').toLowerCase()) ? req.headers.origin : cors.default;
	res.header("Access-Control-Allow-Origin", origin);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });

// change POST request max size
app.use(express.json({ limit: "512mb" }));

app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: `${clientUrl}`, // exactly match the client's origin
        credentials: true, // allow credentials
    })
);

app.get("/", async (req, res) => {
    try {
        const uuid = getUUIDFromCookie(req);
        // expect to recieve a base 64 audio string
        // save the audio to a file
        // transcribe the audio

        const { image, audio } = req.body;
        fs.writeFileSync("audio.webm", audio, "base64");
        const audioStream = fs.createReadStream("audio.webm");

        const transcription = await open.transcribeAudio(audioStream); // expects a stream
        res.json({ transcription });
    } catch (error) {
        console.error(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // print full address sever
    console.log(`http://localhost:${PORT}`);
});

app.post("/chat", async (req, res) => {
    const uuid = getUUIDFromCookie(req);
    console.log(uuid);
    const { image, audio } = req.body; // Get content from request body
    try {
        const base64Audio = audio.replace(/^data:audio\/webm;base64,/, "");
        const audioBuffer = Buffer.from(base64Audio, "base64");
        const audioPath = "audio.webm";
        fs.writeFileSync(audioPath, audioBuffer);
        const audioStream = fs.createReadStream(audioPath);
        const transcription = await open.transcribeAudio(audioStream);
        const emotion = await captureAndAnalyze(image);
        const content = `${emotion}: ${transcription}`;
        const response = await open.chat(
            uuid,
            content,
            audioStream,
            audioBuffer
        );
        res.cookie("uuid", uuid);
        res.json({ response, uuid, transcription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/history", async (req, res) => {
    try {
        const uuid = getUUIDFromCookie(req);
        const history = await getChatMessages(uuid);
        res.json({ history });
    } catch (error) {
        console.error(error);
    }
});

setInterval(() => {
    captureAndAnalyze();
}, 5000);

app.post("/queryVoicesAndAI", async (req, res) => {
    try {
        const uuid = getUUIDFromCookie(req);
        const chats = await open.queryVoiceAndAiMessages(uuid); // Assuming this function returns the needed data
        console.log("hello");
        const responseData = chats.map((chat) => {
            return {
                audioBuffer: chat.audio[0],
                messages: chat.messages
                    .filter((msg) => msg.role === "assistant")
                    .map((msg) => msg.content),
            };
        });
        res.json({ responseData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/summarizeChat", async (req, res) => {
    try {
        const uuid = getUUIDFromCookie(req);
        console.log("summarizeChat", uuid);
        const summary = await open.queryMessages(uuid);
        if (summary) {
            res.json({ summary });
        } else {
            res.status(404).json({ message: "Unable to summarize the chat" });
        }
    } catch (error) {
        console.error(error);
    }
});

// testing
