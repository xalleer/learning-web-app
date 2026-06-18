import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;

function getUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set.');
  return normalizeMongoUri(uri, process.env.MONGODB_DB || 'fsdev_roadmap');
}

function normalizeMongoUri(uri: string, dbName: string) {
  const trimmed = uri.trim().replace(/^["']|["']$/g, '');
  if (!trimmed.startsWith('mongodb+srv://')) return trimmed;

  const [base, query = ''] = trimmed.split('?');
  const hostStart = base.indexOf('@') + 1;
  const hasDatabase = hostStart > 0 && base.slice(hostStart).includes('/');
  const baseWithDb = hasDatabase ? base : `${base}/${dbName}`;
  const params = new URLSearchParams(query);
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  if (!params.has('w')) params.set('w', 'majority');
  if (!params.has('tls')) params.set('tls', 'true');
  return `${baseWithDb}?${params.toString()}`;
}

export async function getDb() {
  if (!clientPromise) {
    clientPromise = new MongoClient(getUri(), {
      tls: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
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
