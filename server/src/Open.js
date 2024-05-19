import OpenAI from 'openai';
import {
  getChatMessages,
  getAssistantAudioChats,
  insertChat
} from './mongo.js';

class Open {

	constructor() {
	  this.chat = this.chat.bind(this);
	  this.open = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		chatCompletion: true,
		logLevel: 'info'
	  });
	  this.systemMessage = {
		role: 'system',
		content: 'You are a compassionate and empathetic therapist. Respond to the user\'s emotions and provide support. The user input will have the following structure: emotion: prompt. Make it obvious that you understand the user\'s emotions.'
	  };
	}

	async transcribeAudio(audio) {
		// audio is a base64 string
		// use OpenAI to transcribe the audio

		const transciption = await this.open.audio.transcriptions.create({
			file: audio,
			model: 'whisper-1',
		}).then(function(response) {
			return response.text;
		}).catch(function(error) {
			return error;
		});

		return transciption;
	}


	async chat(uuid, userContent, audio, audioBuffer) {
		
		console.log("userContent", userContent)
		const messages = await getChatMessages(uuid);
		console.log("messages", messages)
		const history = [this.systemMessage, ...messages, { role: 'user', content: userContent }];
		
		console.log("historyxxxxxxxxxxxxx", history.length)
		return this.open.chat.completions.create({
		  model: 'gpt-3.5-turbo',
		  messages: history
		}).then(async (response) => {
		  const assistantMessage = response.choices[0].message.content;
		  await insertChat(uuid, userContent, assistantMessage,  audioBuffer);
		  return assistantMessage;
		}).catch(error => error);
	}

	async queryMessages(uuid) {
		
		const messages = await getChatMessages(uuid);
		return messages
	}

	async queryVoiceAndAiMessages(uuid){
		const query  = getAssistantAudioChats(uuid);
		console.log(query)
		return query
	}
}
	


export { Open };
