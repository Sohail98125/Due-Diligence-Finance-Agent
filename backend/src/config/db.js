import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected")
    }catch(error){
        console.error(error.message);
        process.exit(0);
    }
}

export default connectDB;