import Course from "../model/course.model.js";
import Chapter from "../model/chapter.model.js";
import Lecture from "../model/lecture.model.js";
import User from "../model/user.model.js";
import { uploadVideoToCloudinary, uploadImageToCloudinary, uploadRawFileToCloudinary } from "../config/multer.js";
import { cloudinary } from "../config/cloudnary.js";
import AdmZip from "adm-zip";


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

    const isEnrolled = user.enrolledCourse && user.enrolledCourse.some(id => (id._id || id).toString() === courseId.toString());
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

// Proxy document content from Cloudinary (bypasses free-tier PDF delivery restriction)
export const proxyDocument = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { userId } = req.user;

    // Find the lecture
    const lecture = await Lecture.findById(lectureId).populate({
      path: 'chapter',
      populate: { path: 'course', model: 'Course' }
    });

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    // Check access
    const courseId = lecture.chapter.course._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isEnrolled = user.enrolledCourse && user.enrolledCourse.some(id => (id._id || id).toString() === courseId.toString());
    const isEducator = lecture.chapter.course.educator.toString() === userId.toString();
    if (!isEnrolled && !isEducator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (lecture.lectureType !== 'file' || !lecture.videoUrl) {
      return res.status(400).json({ success: false, message: "Not a document lecture" });
    }

    // Extract public_id from the Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/raw/upload/v<version>/<public_id>
    const urlParts = lecture.videoUrl.split('/raw/upload/');
    if (urlParts.length < 2) {
      return res.status(400).json({ success: false, message: "Invalid document URL" });
    }
    // Remove version prefix (v123456/) to get the public_id
    const afterUpload = urlParts[1];
    const publicId = afterUpload.replace(/^v\d+\//, '');

    // Use Cloudinary's generate_archive API to download the file as a zip
    // This API is NOT blocked by the free-tier PDF delivery restriction
    const archiveUrl = cloudinary.utils.download_zip_url({
      public_ids: [publicId],
      resource_type: 'raw',
      flatten_folders: true
    });

    // Fetch the zip from Cloudinary
    const archiveResponse = await fetch(archiveUrl);
    if (!archiveResponse.ok) {
      console.error('Cloudinary archive download failed:', archiveResponse.status, archiveResponse.statusText);
      return res.status(502).json({ success: false, message: "Failed to fetch document from storage" });
    }

    const zipBuffer = Buffer.from(await archiveResponse.arrayBuffer());

    // Extract the PDF from the zip
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();

    if (entries.length === 0) {
      return res.status(404).json({ success: false, message: "No document found in archive" });
    }

    const fileEntry = entries[0];
    const fileBuffer = fileEntry.getData();

    // Determine content type from file extension
    const fileName = publicId.split('/').pop() || 'document';
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) contentType = 'application/pdf';
    else if (fileName.endsWith('.doc')) contentType = 'application/msword';
    else if (fileName.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (fileName.endsWith('.ppt')) contentType = 'application/vnd.ms-powerpoint';
    else if (fileName.endsWith('.pptx')) contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(fileBuffer);

  } catch (error) {
    console.error('Proxy document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
