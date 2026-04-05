const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    user = await User.create({
                        username: profile.displayName,
                        email,
                        password: hashedPassword,
                    });
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);
