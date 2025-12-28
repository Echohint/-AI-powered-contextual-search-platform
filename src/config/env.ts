
import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  MONGO_URI: process.env.MONGO_URI || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  // Defaulting to a common text embedding model for Gemini
  EMBEDDING_MODEL: 'embedding-001', 
};
