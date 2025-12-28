
import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    eventId: string; // E1001
    userId: string;
    productId: string; // References P001 (String ID), NOT ObjectId for now to match CSV
    type: 'search' | 'click' | 'add_to_cart' | 'purchase';
    query: string;
    dwellTime: number;
    timestamp: Date;
}

const EventSchema: Schema = new Schema({
    eventId: { type: String },
    userId: { type: String, required: true },
    productId: { type: String, required: true }, // Keeping as String to match CSV 'P001'
    type: { type: String, enum: ['search', 'click', 'add_to_cart', 'purchase'], required: true },
    query: { type: String, default: '' },
    dwellTime: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
