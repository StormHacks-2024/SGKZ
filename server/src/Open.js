import OpenAI from 'openai';

class Open {
	
	constructor() {
		this.chat = this.chat.bind(this);
		this.open = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			chatCompletion: true,
			logLevel: 'info'
		});
		this.history = [
			{ role: 'system', content: 'You are a helpful assistant.' }
		];

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


	async chat(userContent) {
		// Add user message to history
		this.history.push({ role: 'user', content: userContent });

		    // Call OpenAI API
		return this.open.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: this.history
			}).then((response) => {
			const assistantMessage = response.choices[0].message.content;
		
			// Add assistant message to history
			this.history.push({ role: 'assistant', content: assistantMessage });
		
			return assistantMessage;
			}).catch((error) => {
			return error;
		}); //
	  }
}

export { Open };
