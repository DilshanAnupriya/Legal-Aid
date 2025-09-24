// routes/lawyerRoutes.js
const express = require("express");
const { registerLawyer, loginLawyer, getLawyerProfile,getAllLawyers,searchLawyers } = require("../controllers/lawyerController");


const router = express.Router();

// Routes
router.post("/", registerLawyer);
router.post("/login", loginLawyer);
router.get("/profile", getLawyerProfile);
router.get("/",getAllLawyers);
router.get("/search", searchLawyers);


module.exports = router;  