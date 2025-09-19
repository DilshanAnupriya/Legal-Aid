const express = require("express");
const { registerAdmin, loginAdmin, getAdminProfile, getAllLawyers , approveLawyer } = require("../controllers/adminController.js");

const router = express.Router();

router.post("/", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", getAdminProfile);
router.get("/lawyers",getAllLawyers);

// Approve or disapprove a lawyer
router.put("/lawyers/:id/approve", approveLawyer);


module.exports = router;