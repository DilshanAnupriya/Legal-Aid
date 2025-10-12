const express = require("express");
const router = express.Router();
const { createOrUpdateProfile, getProfile } = require("../controllers/lawyerProfileController");

// Auth middleware can be added here
router.post("/", createOrUpdateProfile); // Create or update profile
router.get("/:lawyerId", getProfile);   // Get profile

module.exports = router;
