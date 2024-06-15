import passport from "passport";
import { User } from "../schemas/user.js";
import { Strategy as LocalStrategy } from "passport-local";
import { comparePassword } from "../utils/helpers.js";

// req.session.passport.user = { id: number }
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// req.user
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user)
})

passport.use(
    new LocalStrategy(async (username, password, done) => {
        const findUser = await User.findOne({ username });
        if (!findUser) return done(null, false, { message: "User not found" });
        const isMatch = comparePassword(password, findUser.password);
        if (!isMatch) {
            return done(null, false, { message: "Bad Credentials" })
        }
        return done(null, findUser)
    })
)