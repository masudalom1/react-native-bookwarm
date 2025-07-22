import express from "express";
import Book from "../models/Book.js";
import cloudinary from "../lib/Cloudinary.js";
import { protectRoute } from "../lib/verifyToken.js";
const router = express.Router();

// CREATE BOOK
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, image, ratings } = req.body;

    if (!title || !caption || !image || !ratings) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);

    const newBook = new Book({
      title,
      caption,
      images: uploadResponse.secure_url,
      ratings,
      user: req.user._id,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error("Book upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all books
router.get("/", protectRoute, async (req, res) => {
  try {
    const books = await Book.find().populate("user","username profileImage").sort({createdAt:-1});
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error while fetching books" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error while fetching books" });
  }
});

// DELETE book by ID
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this book" });
    }

    // Extract public ID from image URL for Cloudinary deletion
    const publicId = book.images.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId); 

    await book.deleteOne(); // delete from MongoDB

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error during deletion", error: error.message });
  }
});

export default router;
