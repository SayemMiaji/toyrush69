import mongoose from 'mongoose';

let cached = global.mongooseConn;

export async function dbConnect() {
  if (cached && cached.readyState === 1) return cached;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI in env');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: 'toyrush' });
  cached = mongoose.connection;
  return cached;
}
