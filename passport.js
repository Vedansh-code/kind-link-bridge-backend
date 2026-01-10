const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Database = require("better-sqlite3");

const db = new Database("./users.db");

// Google strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            const email = profile.emails[0].value;
            const username = profile.displayName;

            // check if user exists
            let user = db.prepare(`SELECT * FROM users WHERE email=?`).get(email);

            if (!user) {
                const stmt = db.prepare(
                    `INSERT INTO users (username,email,password) VALUES (?,?,?)`
                );
                const info = stmt.run(username, email, "google");
                user = { id: info.lastInsertRowid, username, email };
            }

            return done(null, user);
        }
    )
);

// session store
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = db.prepare(`SELECT * FROM users WHERE id=?`).get(id);
    done(null, user);
});
