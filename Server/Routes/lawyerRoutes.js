// routes/lawyerRoutes.js
const express = require("express");
const { registerLawyer, loginLawyer, getLawyerProfile,getAllLawyers,searchLawyers,rateLawyer,getLawyerReviews, getLawyerTier } = require("../controllers/lawyerController");

const { protect } = require('../middleware/authmiddleware');

const router = express.Router();

// Routes
router.post("/", registerLawyer);
router.post("/login", loginLawyer);
router.get("/profile", getLawyerProfile);
router.get("/",getAllLawyers);
router.get("/search", searchLawyers);
router.post('/:lawyerId/review',protect,rateLawyer);
router.get("/:lawyerId/review", getLawyerReviews);
router.get("/:lawyerId/tier", getLawyerTier);


module.exports = router;  