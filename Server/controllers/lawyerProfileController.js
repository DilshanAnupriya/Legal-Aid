const LawyerProfile = require("../models/LawyerProfile");
const Lawyer = require("../models/User");

// Create or update profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { lawyerId, experience, aboutMe, contactInfo } = req.body;
    console.log("lawyer id: ", lawyerId)
    // Check if lawyer exists in Lawyer collection
    const lawyer = await Lawyer.findById(lawyerId);
    console.log("lawyer : ", lawyer)
if (!lawyer || lawyer.role !== "lawyer") {
  return res.status(404).json({ success: false, message: "Lawyer not found" });
}

    // Check if profile exists
    let profile = await LawyerProfile.findOne({ lawyer: lawyerId });

    if (profile) {
      // Update existing profile
      profile.experience = experience ?? profile.experience;
      profile.aboutMe = aboutMe ?? profile.aboutMe;
      profile.contactInfo = contactInfo ?? profile.contactInfo;
    } else {
      // Create new profile with lawyer object
      profile = new LawyerProfile({
        lawyer: lawyer._id, // Store reference to lawyer
        experience,
        aboutMe,
        contactInfo,
      });
    }

    await profile.save();

    // Optionally populate lawyer object in response
    await profile.populate("lawyer");

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get lawyer profile
exports.getProfile = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    console.log("lawyer id in get profile: ", lawyerId);

    // Ensure lawyer exists
    const lawyerExists = await Lawyer.findById(lawyerId);
    if (!lawyerExists) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    if (lawyerExists.role !== "lawyer") {
      return res.status(400).json({ message: "Lawyer is not a lawyer" });
    }

    const profile = await LawyerProfile.findOne({ lawyer: lawyerId })
      .populate({
        path: "lawyer",
        select: "firstName lastName tier totalPoints specialization reviews rating"
      })
      .lean(); // Use lean() to get plain JavaScript object

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Transform the response to include lawyer details at root level
    const response = {
      _id: profile._id,
      experience: profile.experience,
      aboutMe: profile.aboutMe,
      contactInfo: profile.contactInfo,
      lawyerDetails: {
        id: profile.lawyer._id,
        firstName: profile.lawyer.firstName,
        lastName: profile.lawyer.lastName,
        tier: profile.lawyer.tier,
        totalPoints: profile.lawyer.totalPoints,
        specialization: profile.lawyer.specialization,
        reviews: profile.lawyer.reviews,
        rating: profile.lawyer.rating
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    res.json({ profile: response });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};