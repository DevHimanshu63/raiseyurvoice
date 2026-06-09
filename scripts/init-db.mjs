// One-shot script: connects to MongoDB, creates the `submissions` collection,
// adds indexes, and prints a quick sanity check.
//
//   node scripts/init-db.mjs
//
import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Tiny .env.local loader (avoid pulling in an extra dep)
const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, '..', '.env.local');
try {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  console.warn('No .env.local found — using existing process.env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'raiseyurvoice';

if (!uri) {
  console.error('MONGODB_URI is missing');
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });

try {
  console.log(`→ Connecting to ${dbName}…`);
  await client.connect();
  const db = client.db(dbName);

  // Create the collection if it doesn't exist
  const existing = await db.listCollections({ name: 'submissions' }).toArray();
  if (existing.length === 0) {
    await db.createCollection('submissions');
    console.log('✓ Created collection: submissions');
  } else {
    console.log('· Collection already exists: submissions');
  }

  // Indexes
  const col = db.collection('submissions');
  await col.createIndex({ createdAt: -1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ category: 1 });
  await col.createIndex({ ticketId: 1 }, { unique: true });
  console.log('✓ Indexes created');

  const count = await col.countDocuments({});
  console.log(`· Existing submissions: ${count}`);

  console.log('\nAll good. The site can now write to MongoDB.');
} catch (err) {
  console.error('✗ Connection / setup failed:');
  console.error(err.message || err);
  process.exit(1);
} finally {
  await client.close();
}
