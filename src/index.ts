
import { connectDB } from './services/database.service';
import { ingestData } from './services/ingestion.service';
import yargs from 'yargs';
// @ts-ignore
import { hideBin } from 'yargs/helpers';

const main = async () => {
    console.log('Script started...');
    await connectDB();

    // @ts-ignore
    const argv = yargs(hideBin(process.argv))
        .option('file', {
            alias: 'f',
            description: 'Path to the data file (CSV or JSON)',
            type: 'string',
        })
        .option('search', {
            alias: 's',
            description: 'Search query string',
            type: 'string'
        })
        .help()
        .alias('help', 'h')
        .parseSync();

    // @ts-ignore
    if (argv.file) {
        // @ts-ignore
        await ingestData(argv.file);
    } else if (argv.search) {
        const { searchProducts } = require('./services/search.service');
        // @ts-ignore
        const results = await searchProducts({ query: argv.search });
        console.log('\n--- Search Results ---');
        results.forEach((p: any, i: number) => {
            console.log(`${i + 1}. [${p.score.toFixed(4)}] ${p.title} - $${p.price}`);
            console.log(`   ${p.description}`);
        });
    } else {
        console.log('Please provide --file to ingest or --search to query.');
    }

    process.exit(0);
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
