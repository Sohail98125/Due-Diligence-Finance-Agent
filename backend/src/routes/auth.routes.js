import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

// google login start here
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }))

// after authenticate google fallback here
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: 'https://due-diligence-finance-agent.vercel.app/login'
    }), (req, res) => {
        // success then go to the frontend 
        res.redirect('https://due-diligence-finance-agent.vercel.app/dashboard')
    }
)

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: 'Logged out' });
    });
});

router.get('/me', async (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            user: req.user
        })
    } else {
        res.status(401).json({
            error: "Not Authenticated"
        })
    }
})

export default router;
