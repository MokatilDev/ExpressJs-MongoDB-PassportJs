import passport from "passport";
import { DiscordUser } from '../schemas/discord-user.js';
import { Strategy as DiscordStrategy } from "passport-discord";

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const findUser = await DiscordUser.findById(id);
        return findUser ? done(null, findUser) : done(null, false);
    } catch (error) {
        console.log(error);
        done(error, false);
    }
})

passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.CLIENT_ID_DISCORD,
            clientSecret: process.env.CLIENT_SECRET_DISCORD,
            callbackURL: process.env.REDIRECT_URL_DISCORD,
            scope: ['identify', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            try {
                const findUser = await DiscordUser.findOne({ discordId: profile.id });
                if (!findUser) {
                    const newUser = new DiscordUser(
                        {
                            username: profile.username,
                            discordId: profile.id
                        }
                    );
                    await newUser.save();
                    done(null, newUser);
                } else {
                    done(null, findUser)
                }
            } catch (err) {
                console.log(err)
            }
        }
    )
)