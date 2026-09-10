import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) {
    console.warn('MONGODB_URI is empty; using memory fallback.');
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed; using memory fallback:', error.message);
    return false;
  }
}
