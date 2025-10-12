const express = require('express');
const router = express.Router();
const {
    MatchNGOFromConversation,
    GetNGORecommendationDetails
} = require('../Controllers/ngoMatchingController');

// Match NGOs based on conversation
router.post('/match', MatchNGOFromConversation);

// Get detailed recommendation for specific NGO
router.get('/recommendation/:ngoId', GetNGORecommendationDetails);

module.exports = router;