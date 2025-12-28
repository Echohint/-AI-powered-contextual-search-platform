
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const expandQuery = async (originalQuery: string): Promise<string[]> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
            You are a search assistant for an eyewear store (Lenskart). 
            Generate 3 alternative search queries for the user's input to improve search scope.
            User Input: "${originalQuery}"
            
            Return ONLY a JSON array of strings. Example: ["query 1", "query 2", "query 3"]
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Query Expansion failed:', error);
        return [originalQuery]; // Fallback to original
    }
};

export const explainResult = async (query: string, productTitle: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `
            Context: User searched for "${query}". The system showed "${productTitle}".
            Explain in 1 short sentence why this product is a good match.
        `;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return 'Matched based on semantic relevance.';
    }
};
