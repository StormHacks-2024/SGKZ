import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import faceapi from 'face-api.js';
import canvas from 'canvas';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("dirname", __dirname);

function captureAndAnalyze(imageBase64Data) {
  const emotion = analyzeEmotion(imageBase64Data).then((emotion) => {
    console.log(emotion);
    return emotion;
  });

  return emotion;
}

// Function to analyze emotions
async function analyzeEmotion(imageBase64Data) {
  try {
    const imageElement = await canvas.loadImage(imageBase64Data);
    const emotions = await detectEmotion(imageElement);
    
    let dominantEmotion = 'neutral';
    let highestProbability = 0;

    console.log(emotions);

    emotions.forEach(emotion => {
      for (const [key, value] of Object.entries(emotion.expressions)) {
        if (value > highestProbability) {
          highestProbability = value;
          dominantEmotion = key;
        }
      }
    });

    console.log(emotions);

    return dominantEmotion;
  } catch (error) {
    console.error('Failed to detect emotion or get response:', error);
  }
}

await faceapi.nets.tinyFaceDetector.loadFromDisk('./models');
await faceapi.nets.faceExpressionNet.loadFromDisk('./models');

const detectEmotion = async (image) => {
  const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
  return detections;
};


export { captureAndAnalyze };