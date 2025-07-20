import express from "express"
import User from "../models/User.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router=express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    res.status(201).json({message: "User registered successfully"});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email },process.env.JWT_SECRET, { expiresIn: "365d" }
    );

    // Send token as cookie
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 365 * 24 * 60 * 60 * 1000, 
      })
      .status(200)
      .json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router