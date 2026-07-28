import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing or malformed",
            });
        }
        // Get token from bearer header
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find logged in user
        const user = await User.findById(decoded.userID);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }

}
