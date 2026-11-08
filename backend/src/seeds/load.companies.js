import  connectDB from '../config/db.js'
import Company from '../models/company.model.js';
import "dotenv/config";

const loadCompanies = async () => {
    try {
        await connectDB();
        const companies = await Company.find({}).lean();
        console.log(`Found ${companies.length} Companies.`);
        return companies;
    } catch (error) {
        console.error("❌ Failed to load Companies data ", error.message);
        process.exit(1);
    }
}
loadCompanies();
export default loadCompanies;