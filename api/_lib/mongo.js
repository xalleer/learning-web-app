import { MongoClient } from 'mongodb';

let clientPromise;

function getUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error('MONGODB_URI is not set.');
    error.status = 500;
    throw error;
  }
  return uri;
}

export async function getDb() {
  if (!clientPromise) {
    clientPromise = new MongoClient(getUri()).connect();
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'fsdev_roadmap');
}

export async function getProgressCollection() {
  const db = await getDb();
  return db.collection('progress');
}
