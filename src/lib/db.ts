import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "jbd_commerce";

let clientPromise: Promise<MongoClient> | undefined;

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  return client.db(dbName);
}

export const demoUserId = "demo-customer";
