const express = require('express');
const router = express.Router();
const { ngoUpload } = require('../config/multer');
const {
    CreateNGO,
    FindAllNgo,
    FindNgoById,
    UpdateNgo,
    DeleteNgo,
    TopRatings,
    GetNgoByCategory,
    UpdateNgoStatus
} = require('../controllers/NgoController');

// Multer configuration for multiple file types
const uploadFields = ngoUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

// Routes
router.post('/ngo/create', uploadFields, CreateNGO);
router.get('/ngo/all', FindAllNgo);
router.get('/ngo/top-ratings', TopRatings);
router.get('/ngo/category/:category', GetNgoByCategory);
router.get('/ngo/:id', FindNgoById);
router.put('/ngo/:id', uploadFields, UpdateNgo);
router.patch('/ngo/:id/status', UpdateNgoStatus);
router.delete('/ngo/:id', DeleteNgo);

module.exports = router;