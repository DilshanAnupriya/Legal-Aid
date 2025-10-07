const User = require("../models/User");

// Map of actions to point values
const POINTS_TABLE = {
  forum_post: 10,
  forum_reply: 5,
  case_completed: 50,
  appointment_held: 20,
  review_received: 10,
};

const updateLawyerPoints = async (lawyerId, actionType) => {
  try {
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== "lawyer") return;

    const points = POINTS_TABLE[actionType] || 0;
    lawyer.totalPoints += points;

    // Add contribution record
    lawyer.contributions.push({
      type: actionType,
      date: new Date(),
      points,
    });

    // Update tier based on totalPoints
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

    await lawyer.save();
    return { success: true, points, newTier: lawyer.tier };
  } catch (err) {
    console.error("Error updating lawyer points:", err);
    return { success: false, error: err.message };
  }
};

module.exports = updateLawyerPoints;
