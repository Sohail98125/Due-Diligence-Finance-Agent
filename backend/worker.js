import connectDb from './src/config/db.js';
import { startAnalysisWorker } from './src/queues/analysis.worker.js';
import 'dotenv/config';

await connectDb();
const worker = startAnalysisWorker();
console.log('Analysis worker started, waiting for the job ...');
const shutdown = async () => {
    await worker.close();
    process.exit(0);
}

process.on('SIGINT', shutdown);  // Ctrl + C press karne par SIGINT signal milta hai, phir shutdown function call hota hai.
process.on('SIGTERM', shutdown); // Jab process ko terminate karne ka signal milta hai, tab shutdown function call hota hai.