import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();


import { connectToDB } from './db.js';


const uri = process.env.MONGO_URI;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

async function run() {
  try {
  await connectToDB();
  console.log("Connected to MongoDB!")
  } catch(e) {
    console.log(e.message)
  }
}

run().catch(console.dir);

async function getChatsCollection() {
  const db = await connectToDB();
  return db.collection('chats');
}

async function getChat(uuid) {
  try {
    const collection = await getChatsCollection();
    let chats = await collection.find({ uuid: uuid }).toArray(); // Using find to get all matches
    if (chats && chats.length > 0) {
      console.log("Chats were found!")
      let allMessages = [];
      chats.forEach(chat => {
        if (chat.messages) {
          allMessages = allMessages.concat(chat.messages);
        }
      });
      console.log(allMessages)
      return { uuid: uuid, messages: allMessages, audio: [] }; // Assuming audio merging is not required
    } else {
      console.log("No chat found, creating a new one");
      let newChat = { uuid: uuid, messages: [], audio: [] };
      await collection.insertOne(newChat);
      return newChat;
    }
  } catch(e) {
    console.log(e.message);
    return null; // Ensure to handle errors gracefully
  }
}

async function getAssistantAudioChats(userId) {
  try {
      const collection = await getChatsCollection(); // Ensures you are connected to your MongoDB database
      const query = {
          "uuid": userId, // Filters by the 'uuid' which is assumed to be your user identifier field
          "audio.path": { $ne: null }, // Checks for audio with a non-null path
          "messages": {
              $elemMatch: { role: 'assistant' } // Ensures at least one message from the assistant
          }
      };
      const chats = await collection.find(query).toArray(); // Executes the query and converts the result to an array
      if (chats.length > 0) {
          console.log("Found chats with assistant messages and audio for user ID:", userId, chats);
      } else {
          console.log("No chats found meeting the criteria for user ID:", userId);
      }
      return chats; // Returns the chats or an empty array if no matches are found
  } catch (e) {
      console.error("Error fetching chats for user ID:", userId, e.message);
      return []; // Handle errors gracefully by returning an empty array
  }
}




// async function insertChat(chat) {
//   const collection = await getCollection();
//   await collection.insertOne(chat).catch(console.dir);
// }

async function insertMessage(uuid, role, content) {
  const collection = await getCollection();
  await collection.updateOne(
    { uuid: uuid },
    { $push: { messages: { role: role, content: content } } }
  );
}

async function getChatMessages(uuid) {
  return await getChat(uuid).then((chat) => {
    // console.log(chat)
    return (
      chat?.messages || (chat.messages = [])
    );
  });
}

async function insertAudio(uuid, audio) {
  const collection = await getCollection();
  await collection.updateOne({ uuid: uuid }, { $push: { audio: audio } });
}

async function insertChat(uuid, userMessage, assistantMessage, audio) {
  console.log("Inserting chat:")
  console.log(userMessage)
  console.log(assistantMessage)
  const collection = await getChatsCollection();
  const chatDocument = {
      uuid: uuid,
      messages: [
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantMessage }
      ],
      audio: [audio]
  };
  await collection.insertOne(chatDocument).catch(console.dir);
}


export { insertChat, insertMessage, getChatMessages, insertAudio, getAssistantAudioChats };
