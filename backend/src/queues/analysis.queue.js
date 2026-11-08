import { createConnection, QUEUE_NAME } from "./connection.js";
import { Queue } from 'bullmq';

const defaultJobOptions = {
    attempts: 1,
    removeOnComplete: {
        age: 60 * 60,
        count: 100
    },
    removeOnFailed: {
        age: 24 * 60 * 60,
        count: 100
    }
}

const analysisQueue = new Queue(
    QUEUE_NAME,
    {
        connection: createConnection,
        defaultJobOptions
    })

export default analysisQueue;
