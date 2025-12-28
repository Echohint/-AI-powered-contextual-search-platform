
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    productId: string; // P001, etc.
    title: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    rating: number;
    color: string;
    material: string;
    embedding: number[];
    createdAt: Date;
}

const ProductSchema: Schema = new Schema({
    productId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    rating: { type: Number, default: 0 },
    color: { type: String },
    material: { type: String },
    embedding: { type: [Number], index: 'vector', default: [] },
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
