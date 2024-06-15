import express, { response } from "express";
import routes from "./routes/index.js"
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import "dotenv/config";
import "./strategies/local-strategy.js";
// import "./strategies/discord-strategy.js";
// import "./strategies/github-strategy.js";

mongoose.connect(process.env.URI)
    .then(() => {
        console.log("✅ - Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("❌ - Failed to connect to MongoDB", err);
    });

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 86400000,
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient()
        })
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.post("/api/auth", (req, res) => {
    passport.authenticate("local", (err, user, info) => {
        if (user) {
            req.login(user, (error) => {
                if (error) {
                    return res.send(error);
                } else {
                    return res.status(200).send({ message: "Authenticated successfully" });
                };
            });
        } else {
            return res.status(401).send(info)
        };
    })(req, res)
});

app.get("/api/auth/status", (req, res) => {
    return req.user ? res.send(req.user) : res.sendStatus(401)
});

app.post("/api/auth/logout", (req, res) => {
    if (!req.user) return res.sendStatus(401);
    req.logout((err) => {
        if (err) return res.sendStatus(400);
        res.sendStatus(200)
    })
});

// app.get("/api/auth/discord", passport.authenticate("discord"));

// app.get("/api/auth/discord/redirect",
//     passport.authenticate("discord"),
//     (req, res) => {
//         console.log(req.user)
//         console.log(req.session)
//         return res.sendStatus(200)
//     }
// );

// app.get("/api/auth/github", passport.authenticate("github"));

// app.get('/api/auth/github/redirect',
//     passport.authenticate('github'),
//     function (req, res) {
//         return res.sendStatus(200)
//     }
// );

app.listen(process.env.PORT, () => {
    console.log(`✅ - Running on ${process.env.PORT}`)
});


