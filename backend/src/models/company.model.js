import mongoose from 'mongoose';

const historicalTrendSchema = new mongoose.Schema({
    year: {
        type: String,
    },
    revenue: {
        type: Number
    },
    net_profit: {
        type: Number
    },
    total_debt: {
        type: Number
    }
}, { _id: false }
)

const companySchema = new mongoose.Schema({
    company_name: {                     // company name 
        type: String,
        required: true
    },
    symbol: {
        type: String,
    },
    aliases: [{
        type: String
    }],
    country: {
        type: String,
    },
    sector: {                           // which sector / industry it's belong
        type: String
    },
    is_financial_sector: {
        type: Boolean,
        default: false,
    },
    currency: {
        type: String,
    },
    unit: {
        type: String,
    },
    financial_year: {
        type: String
    },
    profit_loss: {                      //earning performance
        revenue: {                      //company ne kitni income/sales generate kari
            type: Number,
            default: null
        },
        total_expenses: {               //company ko business chalane mein kitne expense aaye 
            type: Number,
            default: null
        },
        net_profit: {                   //sab expenses ,interest,tax ke baad company ka final profit 
            type: Number,
            default: null
        },
        operating_profit: {             //ise ye samjh aata hai company profitable hai ya nhi 
            type: Number,
            default: null
        },
        net_profit_margin:{
            type:Number,
            default:null
        }
    },
    debt_structure: {
        total_debt: {                   //company ne kitne debt/borrowing liye
            type: Number,
            default: null
        },
        total_equity:{
            type:Number,
            default:null
        },
        cash_and_equivalents: {         //company ke pass kitna paisa aur cash like balance hai
            type: Number,
            default: null
        },
        interest_expense: {             //company ne debt se saal ka kitna interest diya 
            type: Number,
            default: null
        },
        interest_rate_percent: {        // ye company ke multiple loan interest ho sakte hai 
            type: Number,
            default: null
        },
        debt_to_equity_ratio: {         //ye company ke debt ko shareholder equity ko comparison mein measure karta hai 
            type: Number,
            default: null
        },
        interest_coverage_ratio: {
        type: Number,
        default: null
    }
    },
    liquidity: {
        current_assets: {              // aise assets jo short term mein cash mein convert ho sakte hai 
            type: Number,
            default: null
        },
        current_liabilities: {         //company ki short term liabilites     
            type: Number,
            default: null
        },
        current_ratio: {
            type: Number,
            default: null
        },
    },
    historical_trend: [historicalTrendSchema],   // company ke historical finance performance storage 

    yoy_revenue_growth: {            // calculate trends
        type: Number
    },
    yoy_profit_growth: {
        type: Number
    },
    yoy_debt_growth: {
        type: Number
    },

    red_flags: [{                  // rule based red flags 
        type: String
    }],
    notes: [{                      // human readable notes 
        type: String
    }],
    data_warnings: [{              // missing /unreliable/incomplete data warning 
        type: String,
    }],
    data_source: {
        type: {
            type: String,
            enum: ["document", "api", "manual"]
        },
        provider: String,
        source_name: String
    }

},
    {
        timestamps: true
    }
)
export default mongoose.model("company", companySchema);