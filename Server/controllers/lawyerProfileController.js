const LawyerProfile = require("../models/LawyerProfile");
const Lawyer = require("../models/User");
const path = require("path");

// Create or update profile

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { lawyerId, experience, aboutMe, contactInfo } = req.body;

    // Validate lawyerId
    if (!lawyerId) return res.status(400).json({ success: false, message: "LawyerId is required" });

    const lawyerUser = await Lawyer.findById(lawyerId);
    if (!lawyerUser || lawyerUser.role !== "lawyer")
      return res.status(404).json({ success: false, message: "Lawyer not found" });

    let profile = await LawyerProfile.findOne({ lawyer: lawyerId });

    // Handle profile picture (Cloudinary)
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path || req.file.url; // Cloudinary URL
      console.log("✅ Uploaded profile picture URL:", profilePicturePath);
    }

    // Parse contactInfo if it's string
    let parsedContactInfo = contactInfo;
    if (typeof contactInfo === "string") {
      try { parsedContactInfo = JSON.parse(contactInfo); }
      catch { return res.status(400).json({ success: false, message: "Invalid contactInfo format" }); }
    }

    const experienceNum = Number(experience) || 0;

    if (profile) {
      profile.experience = experienceNum;
      profile.aboutMe = aboutMe ?? profile.aboutMe;
      profile.contactInfo = parsedContactInfo ?? profile.contactInfo;
      if (profilePicturePath) profile.profilePicture = profilePicturePath;
    } else {
      profile = new LawyerProfile({
        lawyer: lawyerUser._id,
        experience: experienceNum,
        aboutMe: aboutMe || "",
        contactInfo: parsedContactInfo || {},
        profilePicture: profilePicturePath || "",
      });
    }

    await profile.save();
    await profile.populate("lawyer");
    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error("❌ Error creating/updating profile:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


// Get lawyer profile
exports.getProfile = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    console.log("Fetching profile for lawyer:", lawyerId);

    // Ensure lawyer exists
    const lawyerExists = await Lawyer.findById(lawyerId);
    if (!lawyerExists) {
      return res.status(404).json({ 
        success: false,
        message: "Lawyer not found" 
      });
    }

    if (lawyerExists.role !== "lawyer") {
      return res.status(400).json({ 
        success: false,
        message: "User is not a lawyer" 
      });
    }

    const profile = await LawyerProfile.findOne({ lawyer: lawyerId })
      .populate({
        path: "lawyer",
        select:
          "firstName lastName tier totalPoints specialization reviews rating",
      })
      .lean();

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: "Profile not found" 
      });
    }

    // Handle profile picture URL
    // Cloudinary URLs are already complete, so use them directly
    // Only construct URL if it's a relative path (for backward compatibility)
    let profilePictureUrl = null;
    
    if (profile.profilePicture) {
      // Check if it's already a complete URL (Cloudinary, S3, etc.)
      if (profile.profilePicture.startsWith('http://') || 
          profile.profilePicture.startsWith('https://')) {
        profilePictureUrl = profile.profilePicture;
      } 
      // If it's a relative path, construct full URL
      else if (profile.profilePicture.startsWith('/')) {
        profilePictureUrl = `${req.protocol}://${req.get("host")}${profile.profilePicture}`;
      }
      // If it's just a filename or path without leading slash
      else {
        profilePictureUrl = `${req.protocol}://${req.get("host")}/${profile.profilePicture}`;
      }
    }

    // Transform the response
    const response = {
      _id: profile._id,
      experience: profile.experience,
      aboutMe: profile.aboutMe,
      contactInfo: profile.contactInfo,
      profilePicture: profilePictureUrl,
      lawyerDetails: {
        id: profile.lawyer._id,
        firstName: profile.lawyer.firstName,
        lastName: profile.lawyer.lastName,
        tier: profile.lawyer.tier,
        totalPoints: profile.lawyer.totalPoints,
        specialization: profile.lawyer.specialization,
        reviews: profile.lawyer.reviews,
        rating: profile.lawyer.rating,
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    console.log("✅ Profile fetched successfully, profilePicture:", profilePictureUrl);

    res.json({ 
      success: true,
      profile: response 
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};