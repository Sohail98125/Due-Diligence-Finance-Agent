import axios from 'axios';
import { setCache, getCache } from '../utils/cache.js';
import "dotenv/config";


const BASE_URL = "https://api.roic.ai/v2";
const API_KEY = process.env.ROIC_API_KEY;

const checkRoicError = (data, symbol) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error(`ROIC.ai no data return for ${symbol}`)
    }
}

const fetchProfile = async (symbol) => {
    const response = await axios.get(`${BASE_URL}/company/profile/${symbol}`,
        {
            params: {
                apikey: API_KEY
            }
        }
    )
    const data = response.data?.[0];
    checkRoicError(data, symbol);
    return data;
}

const fetchIncomeStatement = async (symbol) => {
    const response = await axios.get(`${BASE_URL}/fundamental/income-statement/${symbol}`,
        {
            params: {
                apikey: API_KEY,
                period: "annual",
                limit: 4

            }
        }
    )
    checkRoicError(response.data, symbol);
    return response.data;
}

const fetchBalanceSheet = async (symbol) => {
    const response = await axios.get(`${BASE_URL}/fundamental/balance-sheet/${symbol}`,
        {
            params: {
                apikey: API_KEY,
                period: "annual",
                limit: 4
            }
        }
    )
    checkRoicError(response.data, symbol);
    return response.data;
}

const fetchCreditRatios = async (symbol) => {
    const response = await axios.get(`${BASE_URL}/fundamental/ratios/credit/${symbol}`,
        {
            params: {
                apikey: API_KEY,
                period: "annual",
                limit: 4
            }
        }
    )
    checkRoicError(response.data, symbol);
    return response.data;
}

const TICKER_CACHE_TTL = 7 * 24 * 60 * 60;

// naam ya ticker se ROIC ka symbol dhundo
export const resolveTicker = async (query) => {
    const key = `roic:ticker:${query.trim().toLowerCase()}`;

    const cached = await getCache(key);
    if (cached !== null) return cached;

    const response = await axios.get(`${BASE_URL}/tickers/search`, {
        params: { apikey: API_KEY, query: query.trim(), limit: 5 }
    });

    const results = Array.isArray(response.data) ? response.data : [];
    const match = results.find((r) => r.type === "Common Stock") ?? results[0];
    if (!match) return null;

    const found = { symbol: match.symbol, name: match.name };
    await setCache(key, found, TICKER_CACHE_TTL);
    return found;
};



const ROIC_CACHE_TTL = 24 * 60 * 60;

const fetchRoicFromApi = async (symbol) => {
    const [profile, income, balance, credit] = await Promise.all([   //Multiple API requests ko parallel mein chalna
        fetchProfile(symbol),
        fetchIncomeStatement(symbol),
        fetchBalanceSheet(symbol),
        fetchCreditRatios(symbol),
    ])
    return {
        profile,
        income,
        balance,
        credit
    }
}

const fetchRoicData = async (symbol) => {

    const normalizedSymbol = symbol.trim().toUpperCase();
    const key = `roic:${normalizedSymbol}`;

    const cached = await getCache(key);
    if (cached !== null) {
        console.log(`ROIC cache hit: ${normalizedSymbol}`);
        return cached;
    }
    // cache miss but api is called 
    console.log(`ROIC cache miss: ${normalizedSymbol}, API is calling...`);

    const data = await fetchRoicFromApi(normalizedSymbol);
    // result are stored for 24 hours 
    await setCache(key, data, ROIC_CACHE_TTL);
    // data return to the caller 
    return data;
}

export default fetchRoicData;