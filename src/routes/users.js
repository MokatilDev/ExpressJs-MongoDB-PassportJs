import { Router } from "express";
import { validationResult, body, matchedData } from "express-validator"
import { hashPassword } from "../utils/helpers.js";
import { User } from '../schemas/user.js';
import mongoose from "mongoose";

const router = Router();

router.route("/")
    .get(async (req, res) => {
        req.sessionStore.get(req.sessionID, (err, sessionDate) => {
            if (err) console.log(err);
            console.log(sessionDate)
        })
        const users = await User.find({});
        return res.json(users)
    })
    .post(
        body("username")
            .isLength({ max: 20, min: 4 }).withMessage("Username must be at least 4 characters with a max of 20 characters")
            .notEmpty().withMessage("Username cannot be empty")
            .isString().withMessage("Username must be a string!"),
        body("displayName")
            .isLength({ max: 20, min: 5 }).withMessage("displayName must be at least 5 characters with a max of 20 characters")
            .notEmpty().withMessage("displayName cannot be empty")
            .isString().withMessage("displayName must be a string!"),
        body("password")
            .isLength({ max: 20, min: 7 }).withMessage("Password must be at least 7 characters with a max of 20 characters")
            .notEmpty().withMessage("Password cannot be empty")
            .isString().withMessage("Password must be a string!"),
        async (req, res) => {
            try {
                const resulte = validationResult(req);
                if (!resulte.isEmpty()) {
                    return res.status(400).send({ errors: resulte.array() })
                }
                const data = matchedData(req);
                data.password = hashPassword(data.password);
                const existingUser = await User.findOne({ username: data.username });
                if (existingUser) return res.status(400).json({ message: "username is already exist" });

                const newUser = new User({ ...data });
                await newUser.save();

                return res.status(201).json(
                    {
                        username: newUser.username,
                        displayName: newUser.displayName,
                    }
                );
            } catch (error) {
                console.log(error);
                return res.sendStatus(400);
            }
        }
    );


router.route("/:id")
    .delete(async (req, res) => {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        return res.json({ message: "User has been deleted" });
    })
    .patch(
        body("username")
            .isLength({ max: 20, min: 7 }).withMessage("Username must be at least 4 characters with a max of 20 characters")
            .isString().withMessage("Username must be a string!"),
        body("password")
            .isLength({ max: 20, min: 7 }).withMessage("Password must be at least 4 characters with a max of 20 characters")
            .isString().withMessage("Password must be a string!"),
        body("displayName")
            .isLength({ max: 20, min: 5 }).withMessage("displayName must be at least 5 characters with a max of 20 characters")
            .isString().withMessage("displayName must be a string!"),
        async (req, res) => {
            const result = validationResult(req);
            if (!result.isEmpty())
                return res.status(400).json(result.array());

            const data = matchedData(req);
            if (data.password) {
                data.password = hashPassword(data.password)
            }
            const user = await User.findByIdAndUpdate(
                req.params.id,
                {
                    password: data.password,
                    username: data.username,
                    displayName: data.displayName
                },
                {
                    new: true,
                }
            );
            await user.save();
            console.log(user);

            return res.json({ message: "User has been updated" });
        })
    .get(async (req, res) => {
        const id = req.params.id;
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) return res.status(400).json({ message: "Invalid ID" });

        const user = await User.findById(id).select("username displayName");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
    });

export default router