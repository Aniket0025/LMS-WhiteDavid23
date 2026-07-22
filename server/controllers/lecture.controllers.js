import Course from "../model/course.model.js";
import Chapter from "../model/chapter.model.js";
import Lecture from "../model/lecture.model.js";
import User from "../model/user.model.js";
import { uploadVideoToCloudinary, uploadImageToCloudinary, uploadRawFileToCloudinary } from "../config/multer.js";


export const createLecture = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { title, description, content, duration, order, videoUrl: bodyVideoUrl, lectureType: bodyLectureType } = req.body;
    const { userId } = req.user;

    // Validations
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Lecture title is required" });
    }

    let videoUrl = bodyVideoUrl || "";
    let publicId = "";
    let lectureType = bodyLectureType || "video";

    if (!req.file && !videoUrl) {
      return res.status(400).json({ success: false, message: "Lecture file or URL is required" });
    }

    // Check course & educator
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to add lectures" });
    }

    // Check chapter
    const chapter = await Chapter.findOne({ _id: chapterId, course: courseId });
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });

    // Upload file to Cloudinary if file exists in request
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video/");
      const isImage = req.file.mimetype.startsWith("image/");
      const isDoc = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ].includes(req.file.mimetype);

      if (!isVideo && !isImage && !isDoc) {
        return res.status(400).json({ success: false, message: "Invalid file type. Only videos, images, and document files are allowed." });
      }

      try {
        const fileExtension = req.file.originalname.split('.').pop() || '';
        const sanitizedOriginalName = req.file.originalname
          .substring(0, req.file.originalname.lastIndexOf('.'))
          .replace(/[^a-zA-Z0-9\-_]/g, '_')
          .substring(0, 50);
        let fileName = `lecture_${courseId}_${chapterId}_${Date.now()}_${sanitizedOriginalName}`;
        if (fileExtension) {
          fileName += `.${fileExtension}`;
        }
        console.log(`Starting upload for file: ${fileName} (${req.file.mimetype})`);
        
        let uploadResult;
        if (isVideo) {
          uploadResult = await uploadVideoToCloudinary(req.file.buffer, fileName);
          lectureType = "video";
        } else if (isImage) {
          uploadResult = await uploadImageToCloudinary(req.file.buffer, fileName);
          lectureType = "image";
        } else {
          uploadResult = await uploadRawFileToCloudinary(req.file.buffer, fileName);
          lectureType = "file";
        }
        
        videoUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        console.log(`Cloudinary upload successful: ${videoUrl}`);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload file. Please try again.",
          error: err.message 
        });
      }
    }

    // Check order uniqueness
    const existingLecture = await Lecture.findOne({ chapter: chapterId, order: parseInt(order) });
    if (existingLecture) {
      return res.status(400).json({ success: false, message: "Lecture order already exists" });
    }

    // Save lecture
    const lecture = new Lecture({
      course: courseId,
      chapter: chapterId,
      title: title.trim(),
      description,
      content,
      videoUrl,
      publicId, // save Cloudinary public ID for future delete
      duration: duration ? duration.toString() : "0",
      order: parseInt(order) || 1,
      lectureType,
    });

    await lecture.save();

    // Update chapter & course
    chapter.chapterContent.push(lecture._id);
    await chapter.save();
    course.lectures.push(lecture._id);
    await course.save();

    res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error("Create lecture error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all lectures for a chapter
export const getLecturesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    const lectures = await Lecture.find({ chapter: chapterId }).sort({
      order: 1,
    });

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all lectures for a course
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const lectures = await Lecture.find({ course: courseId })
      .populate("chapter", "chapterTitle")
      .sort({ "chapter.createdAt": 1, order: 1 });

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lecture by ID
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId)
      .populate("course", "title educator")
      .populate("chapter", "chapterTitle");

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    res.status(200).json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Delete lecture
export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { userId } = req.user;

    const lecture = await Lecture.findById(lectureId).populate("course");
    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    // Check if user is the educator of this course
    if (lecture.course.educator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this lecture",
        });
    }

    
    await Chapter.findByIdAndUpdate(lecture.chapter, {
      $pull: { chapterContent: lectureId },
    });

    
    await Course.findByIdAndUpdate(lecture.course._id, {
      $pull: { lectures: lectureId },
    });

    await Lecture.findByIdAndDelete(lectureId);

    res
      .status(200)
      .json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reorder lectures in a chapter
export const reorderLectures = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { lectureOrders } = req.body; // Array of { lectureId, newOrder }
    const { userId } = req.user;

    const chapter = await Chapter.findById(chapterId).populate("course");
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    // Check if user is the educator of this course
    if (chapter.course.educator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to reorder lectures",
        });
    }

    // Update lecture orders
    for (const { lectureId, newOrder } of lectureOrders) {
      await Lecture.findByIdAndUpdate(lectureId, { order: newOrder });
    }

    const updatedLectures = await Lecture.find({ chapter: chapterId }).sort({
      order: 1,
    });

    res.status(200).json({ success: true, lectures: updatedLectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lecture with access control
export const getLectureWithAccess = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { userId } = req.user;


    // Find the lecture with course and chapter details
    const lecture = await Lecture.findById(lectureId)
      .populate({
        path: 'chapter',
        populate: {
          path: 'course',
          model: 'Course'
        }
      });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    const courseId = lecture.chapter.course._id;

    // Check if user has purchased/enrolled in this course
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isEnrolled = user.enrolledCourse.includes(courseId);
    const isEducator = lecture.chapter.course.educator.toString() === userId.toString();


    if (!isEnrolled && !isEducator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Please purchase this course to view lectures."
      });
    }

    res.status(200).json({
      success: true,
      lecture,
      hasAccess: true
    });
  } catch (error) {
    console.error('Get lecture with access error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
