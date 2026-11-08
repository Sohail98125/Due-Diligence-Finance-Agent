import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    companyName: {
        type: String,
        trim: true,
        maxlength: 100,
        required: true
    },
    symbol: {
        type: String,
        default: null
    },
    isIndian: {
        type: Boolean,
        default: null
    },
    riskLevel: {
        type: String,
        enum: ["Low", "Medium", "High"],
    },
    llmSummary: {
        type: String,
        required: true,
    },
    redFlags: [{
        type: String
    }],
    newsSources: [{
        title: String,
        url: String
    }],
    financials: {
        type: mongoose.Schema.Types.Mixed  // calculate schema snapshot
    }
},
    {
        timestamps: true
    }
)
export default mongoose.model("Report", reportSchema);

