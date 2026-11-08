import redis from "../config/redis.js";
import 'dotenv/config';

export const getCache = async (key) => {
    try {
        // cache se data read karne ke liye 
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.warn('cache read failed', error.message);
        return null;
    }
}

export const setCache = async (key, value, ttlSeconds) => {
    try {
        await redis.set(
            key,
            JSON.stringify(value),
            {
                Ex: ttlSeconds
            }
        )
    } catch (error) {
        console.warn('cache write failed', error.message);
    }
}
