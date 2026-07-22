import User from "../model/user.model.js";
import Course from "../model/course.model.js";
import userCourseProgress from "../model/courseProgress.model.js";
import Purchase from "../model/purchase.model.js";
import { uploadProfilePictureToCloudinary } from "../config/multer.js";
import bcrypt from "bcryptjs";

// Get user profile data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourse', 'title thumbnail price educator');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Format the user data for the frontend
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '', // Format as YYYY-MM-DD
      enrolledCourse: user.enrolledCourse,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export const updateUserData = async(req,res)=>{
  try {
    const { userId } = req.user;
    const { 
      name, 
      phone, 
      location, 
      bio, 
      birthDate,
      avatar 
    } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prepare update object - only include fields that are provided
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (birthDate !== undefined) {
      // Validate date format if provided
      if (birthDate && !isNaN(new Date(birthDate).getTime())) {
        updateData.birthDate = new Date(birthDate);
      } else if (birthDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid birth date format"
        });
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Exclude password from response
      }
    ).populate('enrolledCourse', 'title thumbnail price educator');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user data error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate unique filename
    const fileName = `profile_${userId}_${Date.now()}`;

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadProfilePictureToCloudinary(req.file.buffer, fileName);
      
      // Update user avatar URL
      user.avatar = uploadResult.secure_url;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        avatar: uploadResult.secure_url,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage"
      });
    }

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

//user enrollCourse
export const userEnrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    // Check if user exists and is a student
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses"
      });
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment"
      });
    }

    // Check if already enrolled
    if (user.enrolledCourse.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    // Enroll user in course
    user.enrolledCourse.push(courseId);
    course.enrolledStudents.push(userId);

    await user.save();
    await course.save();

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course: {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        price: course.price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const userPurchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;
    const { sessionId, paymentMethod = 'stripe' } = req.body;

    // console.log('Processing purchase for user:', userId, 'course:', courseId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Allow both students and educators to purchase courses
    if (user.role !== 'student' && user.role !== 'educator') {
      return res.status(403).json({
        success: false,
        message: "Only students and educators can purchase courses"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId).populate('educator', 'name email');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check for data integrity - educator should exist
    if (!course.educator) {
      console.warn(`Data integrity issue: Course ${courseId} has no associated educator or educator doesn't exist`);
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for purchase"
      });
    }

    // Check if already purchased/enrolled
    const existingPurchase = await Purchase.findOne({
      user: userId,
      course: courseId
    });

    if (existingPurchase || user.enrolledCourse.includes(courseId)) {
      console.log('User already purchased this course, but payment was processed - handling gracefully');
      
      // Since payment was already processed, return success with existing purchase info
      return res.status(200).json({
        success: true,
        message: "Course was already purchased - you already have access to this course",
        purchase: {
          _id: existingPurchase?._id || 'existing',
          course: {
            _id: course._id,
            title: course.title,
            educator: course.educator ? course.educator.name : 'Unknown Educator',
            originalPrice: course.price,
            discount: course.discount || 0,
            finalPrice: course.price - (course.price * (course.discount || 0) / 100)
          },
          paymentMethod: 'stripe',
          purchaseDate: existingPurchase?.purchaseDate || new Date(),
          alreadyPurchased: true
        }
      });
    }

    // Calculate final price after discount
    const finalPrice = course.price - (course.price * (course.discount || 0) / 100);
    
    // console.log('Course price:', course.price, 'Final price after discount:', finalPrice);

    // Create purchase record in database
    const purchase = new Purchase({
      user: userId,
      course: courseId,
      price: finalPrice,
      purchaseDate: new Date()
    });

    await purchase.save();
    // console.log('Purchase record saved:', purchase._id);

    // Enroll user in course
    user.enrolledCourse.push(courseId);
    course.enrolledStudents.push(userId);

    await user.save();
    await course.save();
    
    console.log('User enrolled in course successfully');

    res.status(200).json({
      success: true,
      message: "Course purchased and enrolled successfully",
      purchase: {
        _id: purchase._id,
        course: {
          _id: course._id,
          title: course.title,
          educator: course.educator ? course.educator.name : 'Unknown Educator',
          originalPrice: course.price,
          discount: course.discount || 0,
          finalPrice: finalPrice
        },
        paymentMethod,
        purchaseDate: purchase.purchaseDate
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// update UserCourseProgress
export const updateUserCourseProgress = async (req, res) =>{
  try {
    const { courseId } = req.params;
    const { userId } = req.user;
    const { completed, progress, lectureId, chapterId, chapter, lecture, lastPosition } = req.body;

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId).populate('chapters');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Find existing progress or create new one
    let courseProgress = await userCourseProgress.findOne({
      userId: userId,
      courseId: courseId
    });

    if (!courseProgress) {
      // Create new progress record
      courseProgress = new userCourseProgress({
        userId: userId,
        courseId: courseId,
        completed: false,
        progress: 0,
        completedLectures: [],
        lastPosition: { chapter: 0, lecture: 0 }
      });
    }

    // Handle lecture completion
    if (lectureId && (chapter !== undefined || chapterId)) {
      console.log('Processing lecture completion:', { lectureId, chapterId, chapter, lecture });
      console.log('Current completed lectures before update:', courseProgress.completedLectures);
      
      // Check if lecture is already marked as completed
      const existingCompletion = courseProgress.completedLectures.find(
        cl => cl.lectureId?.toString() === lectureId.toString() || 
              (cl.chapter === chapter && cl.lecture === lecture)
      );

      console.log('Existing completion found:', existingCompletion);

      if (!existingCompletion) {
        // Add new completed lecture
        const completionData = {
          lectureId: lectureId,
          completedAt: new Date()
        };
        
        if (chapterId) completionData.chapterId = chapterId;
        if (chapter !== undefined) completionData.chapter = chapter;
        if (lecture !== undefined) completionData.lecture = lecture;

        console.log('Adding completion data:', completionData);
        courseProgress.completedLectures.push(completionData);
        
        // Calculate progress percentage
        const totalLectures = course.chapters.reduce((total, ch) => {
          return total + (ch.chapterContent ? ch.chapterContent.length : 0);
        }, 0);
        
        if (totalLectures > 0) {
          const completedCount = courseProgress.completedLectures.length;
          courseProgress.progress = Math.round((completedCount / totalLectures) * 100);
          
          // Mark course as completed if all lectures are done
          if (completedCount === totalLectures) {
            courseProgress.completed = true;
          }
        }
      }
    }

    // Handle overall progress updates
    if (completed !== undefined) {
      courseProgress.completed = completed;
    }
    if (progress !== undefined) {
      courseProgress.progress = progress;
    }

    // Handle last position updates
    if (lastPosition) {
      courseProgress.lastPosition = lastPosition;
    }

    console.log('Saving course progress with completed lectures:', courseProgress.completedLectures);
    await courseProgress.save();
    console.log('Course progress saved successfully');

    res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
      data: {
        courseProgress,
        completedLectures: courseProgress.completedLectures
      }
    });
  } catch (error) {
      console.error('Update course progress error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
  }
}

// get userCourseProgress
export const getUserCourseProgress = async(req,res)=>{
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course"
      });
    }

    // Find user's progress for the course
    const courseProgress = await userCourseProgress.findOne({
      userId: userId,
      courseId: courseId
    }).populate('courseId', 'title totalDuration');

    console.log('Retrieved course progress for user', userId, 'course', courseId, ':', courseProgress);

    if (!courseProgress) {
      console.log('No progress found, returning empty progress');
      // Return empty progress if none exists
      return res.status(200).json({
        success: true,
        data: {
          courseProgress: null,
          completedLectures: [],
          lastPosition: { chapter: 0, lecture: 0 }
        }
      });
    }

    console.log('Returning completed lectures:', courseProgress.completedLectures);
    res.status(200).json({
      success: true,
      data: {
        courseProgress,
        completedLectures: courseProgress.completedLectures || [],
        lastPosition: courseProgress.lastPosition || { chapter: 0, lecture: 0 }
      }
    });
  } catch (error) {
      console.error('Get course progress error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
  }
}

// addUserRating
export const userRating = async(req,res) =>{
  try {
    const { courseId } = req.params;
    const { userId } = req.user;
    const { rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to rate it"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if user already rated this course
    const existingRatingIndex = course.ratings.findIndex(r => r.user.toString() === userId);
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
      course.ratings[existingRatingIndex].review = review || course.ratings[existingRatingIndex].review;
      course.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      course.ratings.push({
        user: userId,
        rating,
        review: review || "",
        createdAt: new Date()
      });
    }

    await course.save();

    // Calculate average rating
    const totalRatings = course.ratings.length;
    const averageRating = course.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    res.status(200).json({
      success: true,
      message: existingRatingIndex !== -1 ? "Rating updated successfully" : "Rating added successfully",
      rating: {
        userRating: rating,
        userReview: review,
        averageRating: averageRating.toFixed(1),
        totalRatings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });    
  } 
}

// Check if user has purchased a course
export const checkCoursePurchase = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is enrolled
    const isEnrolled = user.enrolledCourse.includes(courseId);
    
    // Check if there's a purchase record
    const purchase = await Purchase.findOne({
      user: userId,
      course: courseId
    }).populate('course', 'title price');


    res.status(200).json({
      success: true,
      isEnrolled,
      hasPurchased: !!purchase,
      purchase: purchase || null
    });
  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get user's enrolled courses with progress
export const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get user with enrolled courses
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourse',
        select: 'title thumbnail price educator category difficulty rating createdAt chapters',
        populate: {
          path: 'educator',
          select: 'name'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get progress for each enrolled course
    const coursesWithProgress = await Promise.all(
      user.enrolledCourse.map(async (course) => {
        const progress = await userCourseProgress.findOne({
          userId,
          courseId: course._id
        });

        // Calculate total lessons (chapters)
        const totalLessons = course.chapters ? course.chapters.length : 0;
        const progressPercent = progress ? progress.progress : 0;
        const completedLessons = Math.floor((progressPercent / 100) * totalLessons);

        return {
          id: course._id,
          title: course.title,
          instructor: course.educator ? course.educator.name : 'Unknown',
          thumbnail: course.thumbnail || '/api/placeholder/300/200',
          progress: progressPercent,
          totalLessons,
          completedLessons,
          rating: course.rating || 4.5,
          category: course.category || 'General',
          difficulty: course.difficulty || 'Beginner',
          lastAccessed: progress ? progress.updatedAt : course.createdAt,
          isCompleted: progress ? progress.completed : false
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).populate('enrolledCourse');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all progress records for user
    const progressRecords = await userCourseProgress.find({ userId });
    
    // Calculate stats
    const totalEnrolled = user.enrolledCourse.length;
    const completedCourses = progressRecords.filter(p => p.completed).length;
    
    // Calculate learning hours based on completed lectures (15 minutes per lecture)
    const completedLecturesCount = progressRecords.reduce((sum, p) => sum + (p.completedLectures?.length || 0), 0);
    const totalHours = Math.round((completedLecturesCount * 15 / 60) * 10) / 10;

    // Calculate learning streak
    let uniqueDates = new Set();
    progressRecords.forEach(p => {
      if (Array.isArray(p.completedLectures)) {
        p.completedLectures.forEach(l => {
          if (l.completedAt) {
            uniqueDates.add(new Date(l.completedAt).toDateString());
          }
        });
      }
    });

    let currentStreak = 0;
    let checkDate = new Date();
    let checkDateString = checkDate.toDateString();

    if (!uniqueDates.has(checkDateString)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateString = checkDate.toDateString();
    }

    while (uniqueDates.has(checkDateString)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateString = checkDate.toDateString();
    }

    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses: totalEnrolled,
        completedCourses,
        totalHours: totalHours || 0,
        currentStreak: currentStreak || 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all students and educators
export const getAllStudentsAndEducators = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'educator'] } });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.log("User fetch problem", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const educatorAddStudent = async (req, res) => {
  try {
    const { name, email, password, enrolledCourses } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Check if the student already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.role === 'educator') {
        return res.status(400).json({
          success: false,
          message: "User with this email is an educator and cannot be assigned student courses"
        });
      }

      // If user is a student, update they courses
      const coursesToAssign = Array.isArray(enrolledCourses) ? enrolledCourses : [];
      let updated = false;
      
      coursesToAssign.forEach(courseId => {
        if (!user.enrolledCourse.includes(courseId)) {
          user.enrolledCourse.push(courseId);
          updated = true;
        }
      });

      if (updated) {
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: "Student courses updated successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          enrolledCourse: user.enrolledCourse
        }
      });
    }

    // Hash password & create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const coursesToAssign = Array.isArray(enrolledCourses) ? enrolledCourses : [];

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      isVerified: true,
      enrolledCourse: coursesToAssign
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Student created and assigned to courses successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCourse: user.enrolledCourse
      }
    });

  } catch (error) {
    console.error("Educator add student error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add student"
    });
  }
};

export const educatorUpdateStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { enrolledCourses } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: "User is not a student"
      });
    }

    student.enrolledCourse = Array.isArray(enrolledCourses) ? enrolledCourses : [];
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student course access updated successfully",
      student
    });
  } catch (error) {
    console.error("Update student course access error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update student access"
    });
  }
};

export const educatorDeleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: "User is not a student and cannot be deleted by an educator"
      });
    }

    await User.findByIdAndDelete(studentId);
    await Purchase.deleteMany({ user: studentId });

    res.status(200).json({
      success: true,
      message: "Student account deleted successfully"
    });
  } catch (error) {
    console.error("Delete student account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete student account"
    });
  }
};

