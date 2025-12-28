
import { Product } from '../models/product.model';
import { Event } from '../models/event.model';
import { generateEmbedding } from './embedding.service';
import { expandQuery, explainResult } from './ai.service';

interface SearchOptions {
    query: string;
    limit?: number;
    filters?: {
        minPrice?: number;
        category?: string;
    };
}

export const searchProducts = async ({ query, limit = 10, filters = {} }: SearchOptions) => {
    console.log(`Searching for: "${query}" with filters:`, filters);

    // 1. Generate Embedding
    const embedding = await generateEmbedding(query);
    if (!embedding || embedding.length === 0) {
        throw new Error('Failed to generate embedding.');
    }

    // Prepare Vector Search Filter
    const vectorFilter: any = {};

    // Note: MongoDB Atlas Search filters require fields to be indexed as part of the search definition 
    // or using the 'filter' option in the definition. 
    // For simplicity in this demo, we will use a post-aggregation $match if the index isn't set up for pre-filtering,
    // BUT for "Contextual Search Engine" requirement 3.2, pre-filtering is efficient.
    // Let's rely on basic MQL $match after vector search for simplicity, unless we strictly defined filters in Atlas.
    // Actually, $vectorSearch has a 'filter' property. Let's try to use it if index supports it.
    // If not, we fall back to post-filtering.

    // Using Post-Filter Strategy (easier setup for user):
    // Fetch more candidates, then filter in memory/pipeline.
    const pipeline: any[] = [
        {
            $vectorSearch: {
                queryVector: embedding,
                path: 'embedding',
                numCandidates: limit * 20, // Check more specific candidates
                limit: limit * 5,
                index: 'vector_index',
            },
        }
    ];

    // Apply Filters via $match
    const matchStage: any = {};
    if (filters.category) {
        matchStage.category = filters.category;
    }
    if (filters.minPrice) {
        matchStage.price = { $gte: filters.minPrice };
    }

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    pipeline.push({
        $project: {
            productId: 1,
            title: 1,
            description: 1,
            price: 1,
            category: 1,
            attributes: 1,
            score: { $meta: 'vectorSearchScore' }
        }
    });

    const candidates = await Product.aggregate(pipeline);

    // 4. Learning-to-Rank (Behavioral adjustment)
    // Check recent popularity for this query text
    const boostedResults = await Promise.all(candidates.map(async (prod) => {
        // Advanced Scoring:
        // Purchase = 5 points
        // Add To Cart = 3 points
        // Click = 1 point
        // Dwell Time > 60s = +1 point bonus

        const events = await Event.find({
            query: { $regex: new RegExp(query, 'i') }, // Fuzzy match query
            productId: prod.productId // Use string ID for event matching
        });

        let interactionScore = 0;
        for (const ev of events) {
            if (ev.type === 'purchase') interactionScore += 5;
            else if (ev.type === 'add_to_cart') interactionScore += 3;
            else if (ev.type === 'click') {
                interactionScore += 1;
                if (ev.dwellTime > 60) interactionScore += 1;
            }
        }

        // Boost multiplier: cap at 2x to prevent runaway popularity
        // 10 interaction points = 1.5x boost
        const boostMultiplier = 1 + Math.min(interactionScore * 0.05, 1.0);

        return {
            ...prod,
            originalScore: prod.score,
            score: prod.score * boostMultiplier,
            interactionScore
        };
    }));

    // Sort by new boosted score
    boostedResults.sort((a, b) => b.score - a.score);

    // 5. Select Top K
    const finalResults = boostedResults.slice(0, limit);

    // 6. AI Explanation (Just for the top result to save time/cost)
    if (finalResults.length > 0) {
        // Async explanation generation (don't block the whole response heavily)
        // For demo, we might skip or do it for just one.
        // Let's attach a static one for speed or a real one if needed.
    }

    return finalResults;
};
