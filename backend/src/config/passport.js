import passport from 'passport';
import {Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import "dotenv/config";

passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:process.env.GOOGLE_CALLBACK_URL
        },
        async(accessToken, refreshToken,profile,done)=>{
            try{
                const googleId =profile.id;
                const name = profile.displayName;
                const email = profile.emails?.[0].value;
                const avatar = profile.photos?.[0]?.value;

                // check whether user exists or not 
                let user = await User.findOne({
                    googleId
                })

                // if doesn't exist then create one 
                if(!user){
                  user = await User.create({
                        googleId,
                        name,
                        email,
                        avatar
                    })
                }
                return done(null,user);     // (error,user)
            }catch(error){
                return done(error,null);    // (error,user)
            } 
        }
    )
)

passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser(async(id,done)=>{
    try{
        const user = await User.findById(id);
        done(null,user);
    }catch(error){
       done(error,null) 
    }
})

export default passport;