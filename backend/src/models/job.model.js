import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Original natural-language query submitted by the user
    userRequest: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 2000
    },

    // Company name extracted by the LLM
    // Initially null; updated after extraction
    companyName: {
        type: String,
        default: null,
        trim: true,
        maxlength: 100
    },

    status: {
        type: String,
        enum: [
            "queued",
            "understanding_request",
            "fetching_data",
            "processing_data",
            "calculating",
            "generating_report",
            "completed",
            "failed"
        ],
        default: "queued"
    },

    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    errorMessage: {
        type: String,
        default: null
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        default: null
    }
},
    {
        timestamps: true
    });

export default mongoose.model("Job", JobSchema);