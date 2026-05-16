import mongoose from 'mongoose';

const MONGODB_URI_2 = process.env.MONGODB_URI_2;

if (!MONGODB_URI_2) {
  throw new Error('Please define the MONGODB_URI_2 environment variable inside .env');
}

let cached2 = global.mongoose2;

if (!cached2) {
  cached2 = global.mongoose2 = { conn: null, promise: null };
}

async function dbConnect2() {
  if (cached2.conn) return cached2.conn;

  if (!cached2.promise) {
    cached2.promise = mongoose.createConnection(MONGODB_URI_2).asPromise();
  }
  cached2.conn = await cached2.promise;
  return cached2.conn;
}

export default dbConnect2;