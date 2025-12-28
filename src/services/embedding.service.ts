// import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config/env'; // Keep CONFIG import as it might be used elsewhere, or for future reference.

// Local Embedding Setup using Xenova (fits User Requirement for local/fast ingestion)
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks/filling to speed up if models exist
env.allowLocalModels = false;
env.useBrowserCache = false;

let extractor: any = null;

const getExtractor = async () => {
    if (!extractor) {
        console.log('Loading local embedding model (Xenova/all-mpnet-base-v2)...');
        // 'feature-extraction' task - 768 dimensions
        extractor = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
    }
    return extractor;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        // Cleaning text slightly to remove excessive whitespace which might affect embeddings
        const cleanText = text.replace(/\s+/g, ' ').trim();

        // Check for empty string after cleaning
        if (!cleanText) return [];

        const featureExtractor = await getExtractor();
        const output = await featureExtractor(cleanText, { pooling: 'mean', normalize: true });
        // The output is a tensor, convert it to a plain array of numbers
        return Array.from(output.data);
    } catch (error) {
        console.error('Error generating embedding (final):', error);
        throw error;
    }
};
