const User = require("../models/User");


// Map of actions to point values
const POINTS_TABLE = {
  forum_post: 10,
  forum_reply: 5,
  case_completed: 50,
  appointment_held: 20,
  appointment_cancel: -20
};

// Rating-based points (star rating → points)
const RATING_POINTS = {
  5: 10,   // 5 stars = +10 points
  4: 5,    // 4 stars = +5 points
  3: 1,    // 3 stars = +1 point
  2: -5,   // 2 stars = -5 points
  1: -10,  // 1 star = -10 points
};

/**
 * Update lawyer points for general actions
 * @param {String} lawyerId - The lawyer's user ID
 * @param {String} actionType - Type of action (forum_post, case_completed, etc.)
 */
const updateLawyerPoints = async (lawyerId, actionType) => {
  try {
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== "lawyer") {
      return { success: false, error: "Lawyer not found" };
    }

    const points = POINTS_TABLE[actionType] || 0;
    lawyer.totalPoints += points;

    // Add contribution record
    lawyer.contributions.push({
      type: actionType,
      date: new Date(),
      points,
    });

    // Update tier based on totalPoints
    updateLawyerTier(lawyer);

    await lawyer.save();
    return { success: true, points, newTier: lawyer.tier, totalPoints: lawyer.totalPoints };
  } catch (err) {
    console.error("Error updating lawyer points:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Update lawyer points based on user rating
 * @param {String} lawyerId - The lawyer's user ID
 * @param {Number} rating - Star rating (1-5)
 */
const updateLawyerPointsFromRating = async (lawyerId, rating) => {
  try {
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== "lawyer") {
      return { success: false, error: "Lawyer not found" };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    const points = RATING_POINTS[rating] || 0;
    lawyer.totalPoints += points;

    // Prevent negative total points
    if (lawyer.totalPoints < 0) {
      lawyer.totalPoints = 0;
    }

    // Add contribution record
    lawyer.contributions.push({
      type: `review_${rating}_star`,
      date: new Date(),
      points,
    });

    // Update tier based on totalPoints
    updateLawyerTier(lawyer);

    await lawyer.save();
    return { 
      success: true, 
      points, 
      rating,
      newTier: lawyer.tier, 
      totalPoints: lawyer.totalPoints 
    };
  } catch (err) {
    console.error("Error updating lawyer points from rating:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Helper function to update lawyer tier based on total points
 * @param {Object} lawyer - Mongoose lawyer document
 */
const updateLawyerTier = (lawyer) => {
  if (lawyer.totalPoints < 100)
    lawyer.tier = "Community Ally";
  else if (lawyer.totalPoints < 300)
    lawyer.tier = "Legal Helper";
  else if (lawyer.totalPoints < 600)
    lawyer.tier = "Justice Advocate";
  else if (lawyer.totalPoints < 1000)
    lawyer.tier = "Legal Mentor";
  else
    lawyer.tier = "Champion of Justice";
};

/**
 * Calculate average rating for a lawyer
 * @param {String} lawyerId - The lawyer's user ID
 */
const calculateAverageRating = async (lawyerId) => {
  try {
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== "lawyer" || !lawyer.reviews || lawyer.reviews.length === 0) {
      return { success: false, averageRating: 0 };
    }

    const totalRating = lawyer.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / lawyer.reviews.length).toFixed(1);

    // Update the lawyer's rating field
    lawyer.rating = parseFloat(averageRating);
    await lawyer.save();

    return { success: true, averageRating: parseFloat(averageRating), totalReviews: lawyer.reviews.length };
  } catch (err) {
    console.error("Error calculating average rating:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  updateLawyerPoints,
  updateLawyerPointsFromRating,
  calculateAverageRating,
  POINTS_TABLE,
  RATING_POINTS
};