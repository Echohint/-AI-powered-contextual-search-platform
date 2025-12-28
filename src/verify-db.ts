
import { connectDB } from './services/database.service';
import { Product } from './models/product.model';

const verify = async () => {
    await connectDB();
    const count = await Product.countDocuments();
    console.log(`Total Products: ${count}`);

    if (count > 0) {
        const sample = await Product.findOne();
        console.log('Sample Product:', sample?.title);
        console.log('Has Embedding:', sample?.embedding && sample.embedding.length > 0);
        console.log('Embedding Length:', sample?.embedding?.length);
    }
    process.exit(0);
};

verify();
