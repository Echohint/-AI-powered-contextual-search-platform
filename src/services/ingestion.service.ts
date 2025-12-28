
import fs from 'fs';
import csv from 'csv-parser';
import { normalizeProduct, prepareTextForEmbedding } from '../utils/normalizer';
import { generateEmbedding } from './embedding.service';
import { Product } from '../models/product.model';

export const ingestData = async (filePath: string) => {
    console.log(`Starting ingestion for file: ${filePath}`);
    const results: any[] = [];

    // Detect file type roughly by extension
    if (filePath.endsWith('.csv')) {
        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });
    } else if (filePath.endsWith('.json')) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(data);
        if (Array.isArray(json)) {
            results.push(...json);
        } else {
            results.push(json);
        }
    } else {
        throw new Error('Unsupported file format. Please use .csv or .json');
    }

    console.log(`Parsed ${results.length} records. Starting processing...`);

    let count = 0;
    for (const rawData of results) {
        try {
            const normalized = normalizeProduct(rawData);

            // Generate Embedding
            const textToEmbed = prepareTextForEmbedding(normalized);
            const embedding = await generateEmbedding(textToEmbed);

            // Create Product in DB
            await Product.create({
                ...normalized,
                embedding,
            });

            // Rate limiting removed for local embedding
            // await new Promise(resolve => setTimeout(resolve, 5000));

            count++;
            if (count % 10 === 0) {
                console.log(`Processed ${count}/${results.length} products...`);
            }
        } catch (error) {
            console.error(`Failed to ingest product: ${JSON.stringify(rawData)}`, error);
        }
    }

    console.log('Ingestion complete!');
};
