const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        username: profile.displayName,
                        email,
                        password: "google-auth",
                    });
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// session handling
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        done(null, await User.findById(id));
    } catch (err) {
        done(err, null);
    }
});
