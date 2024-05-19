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
    let chat = await collection.findOne({ uuid: uuid });
    if (chat) {
      console.log("Chat was found!")
      console.log(chat)
      console.log(chat.messages)
      if(chat.messages == undefined || chat.messages == null) {
        console.log(
          "Chat messages were undefined or null, setting to empty array"
        )
        chat.messages = [];
      }
      return chat;
    } else {
      await collection
        .insertOne({ uuid: uuid, messages: [], audio: [] })
        .then(() => {
          return { uuid: uuid, messages: [], audio: [] };
        });
    }
  } catch(e) {
    console.log(e.message)
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
    console.log("Received chat")
    console.log(chat)
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


export { insertChat, insertMessage, getChatMessages, insertAudio };
