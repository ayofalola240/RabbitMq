const jwt = require("jsonwebtoken");

async function isAuthenticated(req, res, next) {
    if(!req.headers["authorization"]) {
        return res.status(401).send("Unauthorized");
    }
    const token = req.headers["authorization"].split(" ")[1];
    if (token) {
        try {
        const decoded =  jwt.verify(token, "secret");
        req.user = decoded;
        next();
        } catch (err) {
        res.status(401).send("Unauthorized");
        }
    } else {
        res.status(401).send("Unauthorized");
    }
}

module.exports = isAuthenticated;