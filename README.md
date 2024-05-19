# AI Need Help

"AI Need Help" is a groundbreaking AI therapy assistant application designed to provide immediate emotional support to patients awaiting their online consultations with human therapists. This AI-powered platform leverages advanced machine learning technologies to analyze, respond, and adapt to the emotional states of users, offering a lifelike conversational experience that understands and empathizes with its users.

## Overview

While waiting for appointments, patients can interact with an AI therapist that not only recognizes their emotions through visual cues but also listens and provides feedback via natural language processing. The AI therapist is capable of recognizing a wide range of emotions through the user's facial expressions and voice tone, engaging in a meaningful dialogue that mirrors human therapist interactions. This application serves as a bridge, providing emotional support until the patient can speak with a licensed professional.

## Key Features

### Emotion Recognition
Utilizing the fast faceAPI JavaScript library, the AI therapist identifies emotions from the patient's facial expressions captured through the webcam. This real-time analysis allows the AI to tailor its responses effectively, ensuring that the interaction is both relevant and sensitive to the user's current emotional state.

### Voice Interaction
The application converts live voice recordings to text using OpenAI's Whisper models, facilitating a seamless voice-to-text and text-to-voice interaction. The AI therapist responds with synthesized speech using the SpeechSynthesisUtterance API, enhancing the realism of the conversation.

### Adaptive Conversational Model
Through reinforcement learning (RL) fine-tuning, the AI therapist adapts its responses based on the user's emotional feedback and conversational context. This dynamic adjustment process not only improves the AI's effectiveness over time but also personalizes the interaction for each user.

### Contextual Memory
Each user session is equipped with a unique memory context, managed securely via MongoDB. This approach ensures that every conversation is personalized and continuous, maintaining a coherent flow throughout multiple interactions, if necessary.

### Data Privacy and Security
Users have full control over their data, with the ability to delete their information from the database at any point. Session data is anonymized and secured, providing a safe and private environment for users to express their feelings without concern.

### Comprehensive Reporting
At the end of each session, the AI generates a detailed report that outlines the user's emotional journey and the AI's adaptations throughout the conversation. This report is invaluable for ongoing therapeutic practices and for the AI's learning process.

### Technological Integration
The application integrates multiple cutting-edge technologies:
- **Computer Vision**: For detecting and analyzing facial emotions.
- **Natural Language Processing**: For processing and understanding human speech.
- **Machine Learning**: An ensemble learning pipeline combines facial recognition, speech-to-text, and a meta-learner that enhances the AI's decision-making processes.

## Technical Architecture

### Frontend
Developed using React, the frontend provides a responsive and interactive user interface. It handles real-time audio and video processing, displaying conversational logs and facilitating user interactions.

### Backend
The backend manages live data streaming, context storage, and session management through MongoDB. It supports secure and efficient data handling, essential for maintaining user privacy and application performance.

### Machine Learning Models
- **FaceAPI**: Detects emotions through facial expressions.
- **OpenAI Whisper**: Converts speech to text, enabling the AI to understand verbal cues.
- **Speech Synthesis**: Converts text responses back into speech, allowing for natural dialogue.

## Setup and Installation

Detailed instructions on setting up the application locally:

```bash
# Clone the repository
git clone https://github.com/yourrepository/AiNeedHelp.git

# Navigate to the project directory
cd AiNeedHelp

# Go into the client directory and install dependencies
cd client
npm install
cd ..
cd server
npm install

# Set up necessary environment variables in a .env file
echo "MONGO_URI=<your_mongo_db_uri>" >> .env
echo "OPENAI_API_KEY=<your_openai_api_key>" >> .env

# In this terminal window, start the server
npm start

# Open a new terminal window and start the client
cd ./<PATH>/client
npm start

```

## Using AI Need Help

Visit `http://localhost:3000` after starting the application to interact with the AI therapist. Ensure your webcam and microphone are enabled to use the application to its fullest extent.

## Contributions

Contributions are welcome. If you have ideas for improvements or have found bugs, please fork the repository, make your changes, and submit a pull request.

# SGKZ
Shabbir Yusufali - sya167@sfu.ca - shabzprime

Zachary Chan - zca121@sfu.ca - zach1502

Kian Hosseinkhani - kian_hosseinkhani@sfu.ca - kinster_

George Shramko - shramko.georgiy@gmail.com - shaygeko
