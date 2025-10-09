const express = require('express');
const router = express.Router();
const { ngo } = require('../config/multer'); // Import the ngo multer instance
const {
    CreateNGO,
    FindAllNgo,
    FindNgoById,
    UpdateNgo,
    DeleteNgo,
    TopRatings,
    GetNgoByCategory,
    UpdateNgoStatus,
    FindNgoByEmail,
    // New image management functions
    UploadNgoLogo,
    UploadNgoImages,
    DeleteNgoImage,
    DeleteAllNgoImages
} = require('../controllers/ngoController');

// Multer configuration for multiple file types
const uploadFields = ngo.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

// Basic NGO Routes
router.post('/ngo/create', uploadFields, CreateNGO);
router.get('/ngo/all', FindAllNgo);
router.get('/ngo/top-ratings', TopRatings);
router.get('/ngo/category/:category', GetNgoByCategory);
router.get('/ngo/:id', FindNgoById);
router.get('/by-email/:email', FindNgoByEmail);

// Update NGO (without images)
router.put('/ngo/:id', UpdateNgo);
router.patch('/ngo/:id/status', UpdateNgoStatus);

// Image Management Routes
router.put('/ngo/:id/logo', ngo.single('logo'), UploadNgoLogo);
router.post('/ngo/:id/images', ngo.array('images', 10), UploadNgoImages);
router.delete('/ngo/:id/images', DeleteNgoImage);
router.delete('/ngo/:id/images/all', DeleteAllNgoImages);

// Delete NGO
router.delete('/ngo/:id', DeleteNgo);

module.exports = router;