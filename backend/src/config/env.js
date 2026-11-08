import dotenv from 'dotenv';
dotenv.config();

const env={
    port:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    REDIS_URI:process.env.REDIS_URI,
}

if(!env.MONGO_URI){
    throw new Error("MongoDB_URI is missing in .env file")
}
if(!env.REDIS_URI){
    throw new Error("Redis URI is missing in env file");
}

export default env;
