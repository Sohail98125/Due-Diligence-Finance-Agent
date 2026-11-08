import { Worker } from 'bullmq';
import { createConnection, QUEUE_NAME } from './connection.js';
import { runAnalysis } from '../services/analysis.service.js'

export const startAnalysisWorker = () => {
    const worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            await runAnalysis(job.data.jobId);
        },
        {
            connection: createConnection,
            concurrency: 1
        }
    )

    worker.on('completed', (job) =>
        console.log(`Job ${job.id} completed`))
    worker.on('failed', (job, err) =>
        console.error(`Job ${job.id} failed ${err.message}`))
    worker.on('error', (err) =>
        console.error('Worker error', err.message))
}
