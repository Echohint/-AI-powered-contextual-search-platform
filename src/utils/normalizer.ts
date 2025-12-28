
export const normalizeProduct = (data: any) => {
    // Basic normalization logic
    const productId = (data.product_id || data.id || '').trim();
    const title = (data.title || data.name || '').trim();
    const description = (data.description || data.desc || '').trim();
    const price = parseFloat(data.price || '0');
    const category = (data.category || data.cat || 'Uncategorized').trim();

    // Specific fields from the new dataset
    const brand = (data.brand || '').trim();
    const color = (data.color || '').trim();
    const material = (data.material || '').trim();
    const rating = parseFloat(data.rating || '0');

    return {
        productId,
        title,
        description,
        price: isNaN(price) ? 0 : price,
        category,
        brand,
        color,
        material,
        rating: isNaN(rating) ? 0 : rating,
    };
};

export const prepareTextForEmbedding = (product: any): string => {
    // Combine fields to create a rich context for the embedding
    return `Title: ${product.title}. Category: ${product.category}. Brand: ${product.brand}. Color: ${product.color}. Material: ${product.material}. Description: ${product.description}. Price: ${product.price}.`;
};
