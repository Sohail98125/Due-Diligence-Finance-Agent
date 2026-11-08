import express from 'express';
import cors from 'cors';
import redis from './src/config/redis.js';
import connectDB from './src/config/db.js';
import session from 'express-session';
import passport from './src/config/passport.js';
import authRoutes from './src/routes/auth.routes.js';
import analysisRoutes from './src/routes/analysis.routes.js';
import "dotenv/config";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

await connectDB();
const port = process.env.PORT;

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

app.listen(port, () => {
    console.log(`Server is running on the port ${port}`)
})