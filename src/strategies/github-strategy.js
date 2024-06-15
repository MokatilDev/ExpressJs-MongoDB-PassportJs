import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github";

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.CLIENT_ID_GITHUB,
            clientSecret: process.env.CLIENT_SECRET_GITHUB,
            callbackURL: process.env.REDIRECT_URL_GITHUB
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile)
        }
    )
)