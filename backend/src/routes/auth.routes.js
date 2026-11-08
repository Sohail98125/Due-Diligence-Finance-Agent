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
        failureRedirect: 'http://localhost:5173/login'
    }), (req, res) => {
        // success then go to the frontend 
        res.redirect('http://localhost:5173/dashboard')
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
