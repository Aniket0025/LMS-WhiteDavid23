// models/lecture.model.js
import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: false,
    },
    duration: {
      type: String,
      required: false,
    },
    lectureType: {
      type: String,
      enum: ["video", "image", "file"],
      default: "video",
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
