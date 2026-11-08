import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redis = createClient({
    url: process.env.REDIS_URI
})

redis.on('error', (err) => {
    console.error("Error to connect Redis", err);
})

redis.on("connect",()=>{
    console.log("Redis is connecting ...");
})

redis.on("ready",()=>{
    console.log("Redis connected and ready ");
})

await redis.connect();

export default redis;