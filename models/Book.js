import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    images: {
      type: String,
      default:"",
      
    },
    ratings: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", BookSchema);
