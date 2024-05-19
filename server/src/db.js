import { MongoClient } from 'mongodb';

import dotenv from 'dotenv';
dotenv.config();
let db = null;



export async function connectToDB() {
  if (!db) {
    const client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db('mydb');
  }
  return db;
}
