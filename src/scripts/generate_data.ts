
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const NUM_PRODUCTS = 300;
const NUM_EVENTS = 1000;
const PRODUCTS_FILE = path.join(__dirname, '../../data/products_large.csv');
const EVENTS_FILE = path.join(__dirname, '../../data/events_large.csv');

// --- Data Pools (Lenskart Domain) ---
const brands: Record<string, string[]> = {
    "Sunglasses": ["Ray-Ban", "Vincent Chase", "John Jacobs", "Oakley", "Vogue", "Carrera", "Fossil", "Police"],
    "Eyeglasses": ["Lenskart Air", "Vincent Chase", "John Jacobs", "Ray-Ban", "Titan", "Fastrack"],
    "Contact Lenses": ["Aqualens", "Bausch & Lomb", "Johnson & Johnson", "Alcon", "CooperVision"],
    "Computer Glasses": ["Lenskart Blu", "Vincent Chase", "John Jacobs", "Lenskart Air"]
};

const adjectives = ["Premium", "Lightweight", "Stylish", "Durable", "Trendy", "Classic", "Retro", "Modern", "Flexible", "Matte"];
const colors = ["Black", "Gold", "Silver", "Blue", "Tortoise", "Grey", "Brown", "Transparent", "Gunmetal", "Rose Gold"];
const materials = ["Acetate", "Stainless Steel", "Titanium", "TR90", "Polycarbonate", "Metal", "Ultem"];

const templates: Record<string, string[]> = {
    "Sunglasses": [
        "Protect your eyes in style with these {adj} {noun}. Features UV400 protection.",
        "Classic {noun} with a {adj} finish. Perfect for sunny days and driving.",
        "{adj} shades designed for {intent}. Comes with polarized lenses.",
        "Make a statement with these {adj} {brand} sunglasses. Ideal for {intent}.",
    ],
    "Eyeglasses": [
        "Experience all-day comfort with these {adj} {noun}. Made from lightweight {material}.",
        "Sophisticated {noun} for a professional look. Features {feature}.",
        "{adj} frames that fit perfectly. Great for {intent}.",
        "Minimalist {noun} crafted from {material}. Designed for {intent}.",
    ],
    "Contact Lenses": [
        "Daily disposable {noun} for maximum hygiene and comfort. {feature}.",
        "Breathable lenses perfect for {intent}. Keeps eyes hydrated all day.",
        "{adj} contact lenses with UV blocking. Ideal for active lifestyles.",
    ],
    "Computer Glasses": [
        "Block harmful blue light with these {adj} {noun}. Reduces eye strain.",
        "Perfect for {intent}. These glasses feature {feature} and a {adj} frame.",
        "Work comfortably for hours with these {noun}. Zero power, anti-glare lenses.",
    ]
};

const products_map: Record<string, any> = {
    "Sunglasses": {
        "nouns": ["Aviators", "Wayfarers", "Clubmasters", "Round Sunglasses", "Cat-Eye Sunglasses", "Rectangular Shades", "Sports Sunglasses"],
        "intents": ["beach vacations", "driving", "outdoor sports", "casual outings", "fashion statements"],
        "features": ["polarized lenses", "mirrored coating", "gradient finish", "scratch resistance"]
    },
    "Eyeglasses": {
        "nouns": ["Round Frames", "Rectangular Glasses", "Cat-Eye Frames", "Rimless Glasses", "Half-Rim Frames", "Geometric Glasses"],
        "intents": ["daily office wear", "reading", "screen work", "fashion styling"],
        "features": ["flexible hinges", "adjustable nose pads", "hypoallergenic material", "lightweight design"]
    },
    "Contact Lenses": {
        "nouns": ["Daily Disposables", "Monthly Disposables", "Colored Lenses", "Toric Lenses"],
        "intents": ["daily wear", "sports", "occasional use", "vision correction"],
        "features": ["high water content", "oxygen permeability", "UV block", "silicone hydrogel"]
    },
    "Computer Glasses": {
        "nouns": ["Blue Cut Aviators", "Zero Power Wayfarers", "Computer Glasses", "Gaming Glasses"],
        "intents": ["coding", "gaming", "late-night work", "binge-watching"],
        "features": ["blue light filter", "anti-glare coating", "shock resistance", "yellow tint"]
    }
};

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(1);
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

// --- Product Generation ---
const generateProducts = () => {
    console.log(`Generating ${NUM_PRODUCTS} products...`);
    const header = "product_id,title,description,category,brand,price,rating,color,material\n";
    let content = header;
    const productIds: string[] = [];

    for (let i = 1; i <= NUM_PRODUCTS; i++) {
        const category = getRandom(Object.keys(products_map));
        const details = products_map[category];

        const noun = getRandom(details.nouns);
        const intent = getRandom(details.intents);
        const feature = getRandom(details.features);
        const brand = getRandom(brands[category]);
        const adj = getRandom(adjectives);
        const mat = getRandom(materials);
        const color = getRandom(colors);

        const title = `${brand} ${adj} ${noun}`;
        const template = getRandom(templates[category]);
        const description = template
            .replace('{adj}', adj)
            .replace('{noun}', noun.toLowerCase())
            .replace('{brand}', brand)
            .replace('{intent}', intent)
            .replace('{feature}', feature)
            .replace('{material}', mat);

        const price = Math.round(Math.random() * (10000 - 500) + 500); // Realistic eyewear prices
        const rating = getRandomFloat(3.0, 5.0);
        const pid = `P${i.toString().padStart(4, '0')}`;

        productIds.push(pid);

        const safeDesc = `"${description.replace(/"/g, '""')}"`;
        const safeTitle = `"${title.replace(/"/g, '""')}"`;

        content += `${pid},${safeTitle},${safeDesc},${category},${brand},${price},${rating},${color},${mat}\n`;
    }

    fs.writeFileSync(PRODUCTS_FILE, content);
    console.log(`Products saved to ${PRODUCTS_FILE}`);
    return productIds;
};

// --- Event Generation ---
const queries = [
    "blue light glasses for coding", "running sunglasses", "rayban aviators",
    "black rimless frames", "contact lenses for dry eyes", "stylish eyeglasses",
    "vincent chase computer glasses", "gold round glasses", "sunglasses for driving",
    "prescription glasses", "gaming glasses", "transparent frames"
];

const event_types = ["search", "click", "add_to_cart", "purchase"];
const event_weights = [0.4, 0.4, 0.15, 0.05];

const weightedRandom = (items: string[], weights: number[]) => {
    let i;
    let sum = 0, r = Math.random();
    for (i in weights) {
        sum += weights[i];
        if (r <= sum) return items[i];
    }
    return items[0];
};

const generateEvents = (productIds: string[]) => {
    console.log(`Generating ${NUM_EVENTS} events...`);
    const header = "event_id,user_id,product_id,event_type,query,timestamp,dwell_time_seconds\n";
    let content = header;
    const baseTime = new Date();
    baseTime.setDate(baseTime.getDate() - 30);

    const users = Array.from({ length: 100 }, (_, i) => `U${(i + 1).toString().padStart(3, '0')}`);

    for (let i = 0; i < NUM_EVENTS; i++) {
        const eventId = `E${i.toString().padStart(5, '0')}`;
        const userId = getRandom(users);
        const query = getRandom(queries);
        const productId = getRandom(productIds);
        const type = weightedRandom(event_types, event_weights);

        const timestamp = new Date(baseTime.getTime() + Math.random() * (30 * 24 * 60 * 60 * 1000));
        const dwellTime = type === 'click' ? getRandomInt(10, 300) : 0;

        const safeQuery = `"${query.replace(/"/g, '""')}"`;

        content += `${eventId},${userId},${productId},${type},${safeQuery},${timestamp.toISOString()},${dwellTime}\n`;
    }

    fs.writeFileSync(EVENTS_FILE, content);
    console.log(`Events saved to ${EVENTS_FILE}`);
};

// Run
const pids = generateProducts();
generateEvents(pids);
