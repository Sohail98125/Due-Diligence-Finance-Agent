
import companies from "./companies.js";
import connectDB from '../config/db.js';
import Company from '../models/company.model.js';

const seedCompanies = async()=>{
    try{
        await connectDB();
        const operation = companies.map((company)=>({
            updateOne:{
                filter:{
                    symbol:company.symbol,
                },
                update:{
                    $set:company
                },
                upsert:true
            }
        }))
        // for the update in bulk 
        const result = await Company.bulkWrite(operation);
        console.log("✅ Company seeded successfully");
        console.log(`Inserted ${result.upsertedCount}`);
        console.log(`Updated ${result.modifiedCount}`);
        process.exit(0);
    }catch(error){
        console.error("❌ Seeding failed",error);
        process.exit(1);
    }

}
seedCompanies();
