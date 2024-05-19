import OpenAI from 'openai';
import {
  getChatMessages,
  getAssistantAudioChats,
  insertChat,
  deleteOperation
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
		content: 'You are a therapist assistant. Respond to the user\'s emotions and provide support. The user input will have the following structure: emotion: prompt. Make it obvious that you understand the user\'s emotions.'
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
		console.log('chat id: ' + uuid)
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
		try {
			const messages = await getChatMessages(uuid);
			
			if (!messages || messages.length === 0) {
				console.error('No messages found for this UUID:', uuid);
				return null;
			}
	
			// Filter and structure messages for the prompt
			const conversation = messages
			
			if (!conversation) {
				console.error('No conversation to summarize');
				return null;
			}
			const prompt = 

			conversation.push({role: "assistant", content: prompt});
			return this.open.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: conversation
			}).then(async (response) => {
				console.log(conversation)
				const assistantMessage = response.choices[0].message.content;
				console.log(assistantMessage)

				return assistantMessage;
			}).catch(error => error);

		} catch (error) {
			console.error('Failed to fetch messages:', error);
			return null;
		}
	}

	async queryMessages(uuid) {
		try {
			const messages = await getChatMessages(uuid);
			
			if (!messages || messages.length === 0) {
				console.error('No messages found for this UUID:', uuid);
				return null;
			}
	
			// First request - Analyze the conversation
			const textPrompt = {
				model: 'gpt-3.5-turbo',
				messages: [...messages, {role: "assistant", content: `Write an analysis of your conversation with user in detail.
				First, summarize the previous conversation you had with the user where you were a therapist.
				Secondly, the user content has the following pattern, emotion: content describe user's emotion 
				Thirdly, if there is more than one conversation analyze user's change of emotion throughout conversation and mention your reflection.
				Fourthly, Give recommendation to the doctor how they suppose to talk to patience 
				Format your text for .txt format, make readable and make it formal like a doctor note`}]
			};
	
			// Second request - Summarize the conversation
			const speechPrompt = {
				model: 'gpt-3.5-turbo',
				messages: [...messages, {role: "assistant", content: `Write an short analysis of your conversation with user previously 3 scentences at most.
				First, summarize the previous conversation you had with the user where you were a therapist.
				Secondly, the user content has the following pattern, emotion: content describe user's emotion 
				Thirdly, if there is more than one conversation analyze user's change of emotion throughout conversation and mention your reflection. `}]
			};
	
			const [textResponse, speechResponse] = await Promise.all([
				this.open.chat.completions.create(textPrompt),
				this.open.chat.completions.create(speechPrompt)
			]);
	
			const textMessage = textResponse.choices[0].message.content;
			const speechMessage = speechResponse.choices[0].message.content;
	
			console.log('Analysis:', textMessage);
			console.log('Summary:', speechMessage);
	
			return { textMessage, speechMessage };
		} catch (error) {
			console.error('Failed to fetch messages:', error);
			return null;
		}
	}

	async queryVoiceAndAiMessages(uuid){
		const query  = getAssistantAudioChats(uuid);
		console.log(query)
		return query
	}

	async deleteUser(uuid){
		deleteOperation(uuid)
	}
}
	


export { Open };
