const jwt = require('jsonwebtoken');
let secretKey = process.env.SECRET_KEY;
const userModes = require("../Models/files.Model");

const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ status: false, message: "You are not Authorized" });
        } else {
            console.log(decoded);
            const user = await userModes.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }
            res.status(200).json({ status: true, message: "Welcome to Dashboard", user });
        }
    });
} catch (error) {
    console.error("Error accessing dashboard:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
}
};

module.exports = auth;
