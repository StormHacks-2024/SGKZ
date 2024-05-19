# AI Need Help

"AI Need Help" is an avant-garde AI-driven therapeutic assistant crafted to bridge the temporal gap between patients and mental health professionals. This pioneering application leverages a synthesis of advanced machine learning technologies and robust data handling techniques to offer real-time emotional support and sophisticated conversational capabilities.

## Overview

"AI Need Help" facilitates a real-time interactive platform where patients can converse with an AI therapist while waiting for their online doctor appointments. By analyzing facial expressions and vocal nuances, the AI therapist can discern the patient's emotional state and adapt its responses accordingly. This system not only supports patients through empathetic engagement but also prepares detailed session reports that aid both the AI's learning process and the subsequent human therapist consultation.

## Core Features

### Real-Time Emotion Recognition
Employing the fast faceAPI JavaScript library, the AI therapist assesses the patient's current emotional state by analyzing visual data captured through the webcam. This real-time emotion recognition allows the AI to tailor its interactions, ensuring responses are both contextually and emotionally aligned with the patient's needs.

### Advanced Voice Interaction
Voice interactions are captured as live voice recordings, which are then converted into a digital format using base64 encoding to create Blobs. These voice Blobs are further decrypted into textual data using OpenAI's Whisper models, facilitating a seamless transition from speech to text.

### Dynamic Conversational AI
The backbone of "AI Need Help" is its ensemble learning pipeline, which integrates a computer vision model for facial emotion recognition, a decoder transformer model for robust speech-to-text capabilities, and a meta learner. This meta learner enhances the AI's decision-making process, ensuring that the therapeutic advice and responses are not only context-aware but also increasingly empathetic over time.

### Privacy-Centric Data Handling
To ensure privacy and security, each session is handled with strict anonymity and security protocols. Users have the autonomy to delete their session data from our MongoDB databases, maintaining a high standard of data privacy. Live data streaming and context management are facilitated through secure, encrypted channels, guaranteeing that all user interactions remain confidential.

### Contextual Memory and Adaptive Learning
Each user interaction enriches the AI's learning, with session-specific data dynamically adjusting the AI's behavioral model. This RL (Reinforcement Learning) fine-tuning process allows the AI to evolve continuously, enhancing its capability to provide nuanced emotional support.

## Technical Architecture

### Frontend
The application's frontend is engineered using React, offering a dynamic and responsive user interface that handles real-time data processing and displays conversational logs effectively.

### Backend
Our backend architecture is designed for optimal data flow and storage, with MongoDB serving as the backbone for managing live session data and user contexts. This setup supports robust data operations and seamless state management across user sessions.

### AI and Machine Learning Pipeline
- **FaceAPI**: Utilizes cutting-edge facial recognition technologies to detect and analyze users' emotional states.
- **OpenAI Whisper**: Transforms audio recordings into accurate textual representations, enabling the AI to understand and process user speech.
- **Speech Synthesis**: Leverages modern synthesis technologies to convert textual responses back into natural-sounding speech, enriching the conversational experience.
- **Ensemble Learning and Meta Learning**: Combines multiple machine learning models to refine the AI's responses, ensuring they are both empathetic and contextually appropriate. The meta learner, in particular, plays a critical role in enhancing the AI's performance by continuously learning from each interaction.

## Setup and Installation

```bash
# Clone the repository
git clone https://github.com/yourrepository/AiNeedHelp.git

# Navigate to the project directory
cd AiNeedHelp

# Install dependencies
npm install

# Configure environment variables
echo "MONGO_URI=<your_mongo_db_uri>" >> .env
echo "OPENAI_API_KEY=<your_openai_api_key>" >> .env

# Start the application
npm start
```
---

Shabbir Yusufali - sya167@sfu.ca - shabzprime

Zachary Chan - zca121@sfu.ca - zach1502

Kian Hosseinkhani - kian_hosseinkhani@sfu.ca - kinster_

George Shramko - shramko.georgiy@gmail.com - shaygeko
