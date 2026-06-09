import { MongoClient, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'raiseyurvoice';

if (!uri) {
  // We don't throw at import time because Next.js may import this file during
  // build steps where env vars are not present. We throw lazily in getDb().
  // eslint-disable-next-line no-console
  console.warn('[mongodb] MONGODB_URI is not set. Set it in .env.local');
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error('MONGODB_URI is not configured');
  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000
    });
    global.__mongoClientPromise = client.connect();
  }
  return global.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(dbName);
}

export async function getSubmissionsCollection() {
  const db = await getDb();
  const col = db.collection('submissions');
  // Best-effort indexes — safe to call repeatedly
  try {
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ status: 1 });
    await col.createIndex({ category: 1 });
  } catch {
    // ignore index creation errors (e.g. permission)
  }
  return col;
}
