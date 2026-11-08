import { createNodeRedisClient } from 'bullmq';
import redis from '../config/redis.js';

export const QUEUE_NAME = "analysis";

export const createConnection = createNodeRedisClient(redis);