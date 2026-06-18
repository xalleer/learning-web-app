import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;

function getUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set.');
  return uri;
}

export async function getDb() {
  if (!clientPromise) {
    clientPromise = new MongoClient(getUri(), {
      tls: true,
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'fsdev_roadmap');
}

export async function getProgressCollection() {
  const db = await getDb();
  return db.collection('progress');
}

export async function pingMongo() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return {
    ok: true,
    dbName: db.databaseName,
  };
}
