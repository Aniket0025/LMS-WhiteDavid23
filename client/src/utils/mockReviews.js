// client/src/utils/mockReviews.js

export const SAMPLE_REVIEWS_POOL = [
  {
    name: "Aarav Sharma",
    rating: 5,
    review: "This course surpassed all my expectations! The step-by-step explanations and real-world projects made learning effortless and highly engaging.",
    timeAgo: "2 days ago"
  },
  {
    name: "Priya Patel",
    rating: 5,
    review: "Outstanding quality! The instructor explains complex concepts with remarkable clarity. Definitely worth every minute spent.",
    timeAgo: "1 week ago"
  },
  {
    name: "Rohan Mehta",
    rating: 4,
    review: "Very comprehensive curriculum. The practical hands-on exercises helped reinforce everything covered in the lecture modules.",
    timeAgo: "2 weeks ago"
  },
  {
    name: "Ananya Iyer",
    rating: 5,
    review: "Top-notch course content! Perfect for both beginners and experienced learners looking to upskill quickly.",
    timeAgo: "3 weeks ago"
  },
  {
    name: "Vikram Singh",
    rating: 5,
    review: "Clear, concise, and highly informative. The course structure is well organized and easy to follow along.",
    timeAgo: "1 month ago"
  }
];

export const getCourseReviewsData = (course) => {
  const existingRatings = course?.ratings || [];
  
  if (existingRatings.length > 0) {
    const total = existingRatings.reduce((sum, r) => sum + (r.rating || 5), 0);
    const avg = parseFloat((total / existingRatings.length).toFixed(1));
    return {
      reviews: existingRatings,
      avgRating: avg,
      totalRatings: existingRatings.length
    };
  }

  // Generate realistic static sample reviews for courses without user reviews
  const seed = (course?._id || course?.title || 'course').toString().length;
  const mockCount = 3 + (seed % 3); // 3 to 5 reviews
  
  const reviews = SAMPLE_REVIEWS_POOL.slice(0, mockCount).map((item, idx) => ({
    _id: `mock-review-${idx}-${seed}`,
    user: {
      name: item.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`
    },
    rating: item.rating,
    review: item.review,
    createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 4).toISOString()
  }));

  const totalMockRatings = reviews.length + 18 + (seed * 2);

  return {
    reviews: reviews,
    avgRating: 4.8,
    totalRatings: totalMockRatings
  };
};
