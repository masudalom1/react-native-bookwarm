import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Optional: Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
