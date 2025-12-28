
import mongoose from 'mongoose';
import { CONFIG } from '../config/env';

export const connectDB = async () => {
    try {
        if (!CONFIG.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(CONFIG.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
