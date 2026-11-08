import express from 'express';
import cors from 'cors';
import redis from './src/config/redis.js';
import connectDB from './src/config/db.js';
import session from 'express-session';
import passport from './src/config/passport.js';
import authRoutes from './src/routes/auth.routes.js';
import analysisRoutes from './src/routes/analysis.routes.js';
import "dotenv/config";
import { startAnalysisWorker } from './src/queues/analysis.worker.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

await connectDB();

let worker = null;

if (process.env.START_WORKER === 'true') {
    worker = startAnalysisWorker();
    console.log('Analysis worker started');
}

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000   //1 day
    }
}))

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Backend API is running'
    });
});

app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
app.use('/api', analysisRoutes);

const server = app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});

const shutdown = async () => {
    console.log('Shutting down server...');

    const closeServer = new Promise((resolve) => {
        server.close(resolve);
    });

    try {
        await Promise.all([
            closeServer,
            worker ? worker.close() : Promise.resolve()
        ]);

        console.log('Server and worker closed');
        process.exit(0);
    } catch (error) {
        console.error('Shutdown error:', error);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);