import { MongoClient, ServerApiVersion } from 'mongodb';
import {mongoConfig} from './settings.js';
const uri = "mongodb+srv://smaida:bankease$2025@bankease.vup5n6q.mongodb.net/?retryWrites=true&w=majority&appName=BankEase";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnection = async () => {
  let _db;
  try {
    await client.connect();
    _db = client.db(mongoConfig.database);
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return _db;
  } catch(e){
    console.log(e);
  }
}

const closeConnection = async () => {
  await client.close();
};

export {dbConnection, closeConnection}