import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

async function getCollection() {
  await client.connect();
  return await client.db("admin").collection("chats");
}

async function getChat(uuid) {
  const collection = await getCollection();
  const chat = await collection.findOne({ uuid: uuid });
  if (chat) {
    return chat;
  } else {
    await collection
      .insertOne({ uuid: uuid, messages: [], audio: [] })
      .then(() => {
        return { uuid: uuid, messages: [], audio: [] };
      });
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
  await getChat(uuid).then((chat) => {
    return (
      chat?.messages ?? insertChat({ uuid: uuid, messages: [], audio:[] }).then(() => [])
    );
  });
}

async function insertAudio(uuid, audio) {
  const collection = await getCollection();
  await collection.updateOne({ uuid: uuid }, { $push: { audio: audio } });
}

async function insertChat(uuid, userMessage, assistantMessage, audio) {
  const collection = await getCollection();
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
