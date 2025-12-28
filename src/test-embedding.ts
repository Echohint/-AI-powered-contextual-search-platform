
import { generateEmbedding } from './services/embedding.service';

const test = async () => {
    console.log('Testing local embedding generation...');
    try {
        const vector = await generateEmbedding('Test query for Lenskart sunglasses');
        console.log('Success! Vector length:', vector.length);
        if (vector.length === 768) {
            console.log('Model verified: all-mpnet-base-v2 (768 dimensions)');
        } else {
            console.log('Warning: Unexpected dimension size');
        }
    } catch (e) {
        console.error('Embedding failed:', e);
    }
};

test();
