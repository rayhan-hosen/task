const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    // Read token from Cookie OR Authorization header
    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(" ")[1];  // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify Token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.userId = decoded.userId;
        next();
    });
};

module.exports = authenticateToken;
