const express = require("express");
const router = express.Router();
const { createOrUpdateProfile, getProfile } = require("../controllers/lawyerProfileController");
const { lawyer } = require('../config/multer');

router.post("/", lawyer.single("profilePicture"), createOrUpdateProfile); // Upload profile picture
router.get("/:lawyerId", getProfile);

module.exports = router;
