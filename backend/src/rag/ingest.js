import loadCompanies from '../seeds/load.companies.js';
import companyToText from './companyToText.js';
import collection from './chroma.js';
import embeddings from './embeddings.js';
import "dotenv/config";

const ingestCompanies = async () => {
    try {
        //=========== load data from mongodb ================
        const companies = await loadCompanies();
        console.log(`Found ${companies.length} Companies.`);
    
        //=========== convert mongodb into plain text =======
        const texts = companies.map(companyToText);

        //=========== text to embedding =====================
        const embedding = await embeddings.embedDocuments(texts);

        //=========== Unique Ids ============================
        const ids = companies.map(
            (company) =>
                company.symbol
        );

        //=========== MetaData ===============================

        const metadatas = companies.map((company) => ({
            company_name: company.company_name,
            symbol: company.symbol,
            sector: company.sector,
            is_financial_sector: company.is_financial_sector,
            country: company.country,
            financial_year: company.financial_year,
            unit: company.unit,
            currency: company.currency,
        }));

        //=========== Store data in Chroma ==================
        await collection.add({
            ids,
            embeddings: embedding,
            documents:texts,
            metadatas

        });
        console.log(`✅ ${companies.length} companies stored in Chroma`)
        process.exit(0);
    }catch(error){
         console.error("❌ Ingestion failed", error.message);
        process.exit(1);
    }
} 
ingestCompanies();

export default ingestCompanies;