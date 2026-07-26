// import mongoose from 'mongoose';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  console.log("MongoDB Memory Server Connected");
  return mongoose.connection;
};

export const stopDatabase = async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
};













































// export const connectToDatabase = async () => {
//   if (mongoose.connection.readyState === 1) {
//     return mongoose.connection;
//   }

//   const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-building';

//   try {
//     await mongoose.connect(mongoUri, { autoIndex: true, serverSelectionTimeoutMS: 3000 });
//     console.log(`MongoDB connected at ${mongoUri}`);
//     return mongoose.connection;
//   } catch (error) {
//   console.warn(`MongoDB unavailable at ${mongoUri}; continuing with the existing app startup.`);
//   console.error(error);
//   return null;
// }
// };

// export const stopDatabase = async () => {
//   await mongoose.disconnect();
// };
