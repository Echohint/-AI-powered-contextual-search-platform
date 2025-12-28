
import express from 'express';
import cors from 'cors';
import { connectDB } from './services/database.service';
import { searchProducts } from './services/search.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
import { explainResult } from './services/ai.service';

app.get('/api/explain', async (req, res) => {
    try {
        const { query, productTitle } = req.query;
        if (!query || !productTitle) return res.status(400).json({ error: 'Missing params' });

        const explanation = await explainResult(query as string, productTitle as string);
        return res.json({ explanation });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const category = req.query.category as string;
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;

        const results = await searchProducts({
            query,
            limit,
            filters: { category, minPrice }
        });

        return res.json({ results });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// Tracking Endpoint
import { Event } from './models/event.model';

app.post('/api/track', async (req, res) => {
    try {
        const { query, productId, type } = req.body;
        if (!query || !productId || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await Event.create({ query, productId, type });
        console.log(`Tracked event: ${type} for product ${productId}`);
        return res.json({ success: true });
    } catch (error: any) {
        console.error('Tracking Error:', error);
        return res.status(500).json({ error: 'Tracking failed' });
    }
});

// Ingestion Endpoint
import { ingestData } from './services/ingestion.service';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

app.post('/api/ingest', async (req, res) => {
    try {
        console.log('Triggering ingestion...');
        const filePath = path.join(__dirname, '../data/products_large.csv');
        const eventsPath = path.join(__dirname, '../data/events_large.csv');

        // 1. Ingest Products
        const { Product } = require('./models/product.model');
        await Product.deleteMany({});
        await ingestData(filePath);

        // 2. Ingest Historical Events
        await Event.deleteMany({});
        const events: any[] = [];
        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(eventsPath)
                .pipe(csv())
                .on('data', (data) => events.push(data))
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });

        for (const ev of events) {
            await Event.create({
                eventId: ev.event_id,
                userId: ev.user_id,
                productId: ev.product_id,
                type: ev.event_type,
                query: ev.query,
                dwellTime: parseFloat(ev.dwell_time_seconds || '0'),
                timestamp: new Date(ev.timestamp)
            });
        }
        console.log(`Ingested ${events.length} historical events.`);

        return res.json({ message: 'Ingestion of Products & Events completed!' });

    } catch (error: any) {
        console.error('Ingestion API Error:', error);
        return res.status(500).json({ error: 'Ingestion Failed', details: error.message });
    }
});

// Start Server
const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
