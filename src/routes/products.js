import { Router } from "express";

const router = Router();

router.route("/")
    .get((req, res) => {
        if (req.signedCookies.hello && req.signedCookies.hello == "world") {
            return res.send([
                {
                    name: "Wireless Mouse",
                    id: "WM12345",
                    price: 29.99
                }
            ])
        }
        return res.status(403).send({ message: "Sorry, You need the correct cookie." })
    });

export default router;