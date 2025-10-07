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
    const profile = await LawyerProfile.findOne({ lawyer: lawyerId }).populate("lawyer", "firstName lastName tier totalPoints");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
