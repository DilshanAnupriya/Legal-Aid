const NGO = require('../Models/NgoModel');

// Analyze conversation and match with NGOs
const MatchNGOFromConversation = async (req, res) => {
    try {
        const { conversationHistory, lastMessage } = req.body;

        if (!conversationHistory || !Array.isArray(conversationHistory)) {
            return res.status(400).json({
                message: "error",
                error: "Conversation history is required"
            });
        }

        // Extract keywords and topics from conversation
        const analysis = analyzeConversation(conversationHistory, lastMessage);

        // Find matching NGOs based on analysis
        const matchedNGOs = await findMatchingNGOs(analysis);

        // Score and rank NGOs
        const rankedNGOs = rankNGOsByRelevance(matchedNGOs, analysis);

        res.status(200).json({
            message: "success",
            analysis: {
                detectedCategories: analysis.categories,
                keywords: analysis.keywords,
                urgencyLevel: analysis.urgency
            },
            recommendations: rankedNGOs.slice(0, 3), // Top 3 recommendations
            totalMatches: matchedNGOs.length
        });
    } catch (e) {
        console.error('NGO Matching Error:', e);
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Analyze conversation to extract legal topics and categories
function analyzeConversation(conversationHistory, lastMessage) {
    const fullText = conversationHistory
        .map(msg => msg.text.toLowerCase())
        .join(' ') + ' ' + (lastMessage || '').toLowerCase();

    const categories = [];
    const keywords = [];
    let urgency = 'normal';

    // Category detection with keywords
    const categoryPatterns = {
        'Human Rights & Civil Liberties': [
            'human rights', 'civil liberties', 'freedom', 'discrimination',
            'constitutional rights', 'civil rights', 'police', 'arrest',
            'detention', 'torture', 'abuse', 'privacy', 'speech'
        ],
        'Women\'s Rights & Gender Justice': [
            'women', 'gender', 'sexual harassment', 'domestic violence',
            'dowry', 'maternity', 'equal pay', 'workplace harassment',
            'sexual assault', 'rape', 'female', 'girl', 'mother'
        ],
        'Child Protection': [
            'child', 'children', 'minor', 'custody', 'adoption',
            'child abuse', 'child labor', 'education rights', 'guardian',
            'juvenile', 'underage', 'pediatric', 'school'
        ],
        'Labor & Employment Rights': [
            'employment', 'labor', 'worker', 'job', 'salary', 'wage',
            'workplace', 'termination', 'fired', 'contract', 'overtime',
            'benefits', 'pension', 'layoff', 'employer', 'employee'
        ],
        'Refugee & Migrant Rights': [
            'refugee', 'asylum', 'immigrant', 'migrant', 'visa',
            'deportation', 'citizenship', 'stateless', 'border',
            'foreign worker', 'migration', 'displaced'
        ],
        'LGBTQ+ Rights': [
            'lgbtq', 'lgbt', 'gay', 'lesbian', 'transgender', 'queer',
            'sexual orientation', 'gender identity', 'same-sex',
            'discrimination', 'pride', 'transgender rights'
        ]
    };

    // Detect categories and extract keywords
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
        const matches = patterns.filter(pattern =>
            fullText.includes(pattern)
        );

        if (matches.length > 0) {
            categories.push(category);
            keywords.push(...matches);
        }
    }

    // Detect urgency
    const urgentKeywords = [
        'urgent', 'emergency', 'immediate', 'help', 'asap',
        'crisis', 'danger', 'threat', 'violence', 'abuse'
    ];

    if (urgentKeywords.some(keyword => fullText.includes(keyword))) {
        urgency = 'high';
    }

    // Remove duplicate keywords
    const uniqueKeywords = [...new Set(keywords)];

    return {
        categories: categories.length > 0 ? categories : ['General Legal Aid'],
        keywords: uniqueKeywords,
        urgency,
        messageCount: conversationHistory.length
    };
}

// Find NGOs matching the conversation analysis
async function findMatchingNGOs(analysis) {
    const query = {
        status: 'active'
    };

    // If specific categories detected, filter by them
    if (analysis.categories.length > 0 &&
        !analysis.categories.includes('General Legal Aid')) {
        query.category = { $in: analysis.categories };
    }

    const ngos = await NGO.find(query)
        .sort({ rating: -1, createdAt: -1 })
        .limit(10);

    return ngos;
}

// Rank NGOs by relevance to conversation
function rankNGOsByRelevance(ngos, analysis) {
    return ngos.map(ngo => {
        let relevanceScore = 0;

        // Category match (highest weight)
        if (analysis.categories.includes(ngo.category)) {
            relevanceScore += 50;
        }

        // Keyword matching in description
        const ngoText = (ngo.name + ' ' + ngo.description).toLowerCase();
        const keywordMatches = analysis.keywords.filter(keyword =>
            ngoText.includes(keyword)
        ).length;
        relevanceScore += keywordMatches * 5;

        // Rating boost
        relevanceScore += ngo.rating * 5;

        // Urgency handling - prioritize higher-rated NGOs for urgent cases
        if (analysis.urgency === 'high' && ngo.rating >= 4) {
            relevanceScore += 15;
        }

        return {
            ...ngo.toObject(),
            relevanceScore,
            matchReason: generateMatchReason(ngo, analysis)
        };
    })
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Generate human-readable match reason
function generateMatchReason(ngo, analysis) {
    const reasons = [];

    if (analysis.categories.includes(ngo.category)) {
        reasons.push(`Specializes in ${ngo.category}`);
    }

    if (ngo.rating >= 4.5) {
        reasons.push('Highly rated organization');
    }

    if (analysis.urgency === 'high') {
        reasons.push('Available for urgent cases');
    }

    return reasons.length > 0
        ? reasons.join(' • ')
        : 'Matches your legal needs';
}

// Get detailed NGO recommendation with booking info
const GetNGORecommendationDetails = async (req, res) => {
    try {
        const { ngoId } = req.params;

        const ngo = await NGO.findById(ngoId);

        if (!ngo) {
            return res.status(404).json({ message: "not found" });
        }

        res.status(200).json({
            message: "success",
            data: {
                ...ngo.toObject(),
                bookingInfo: {
                    available: true,
                    contact: ngo.contact,
                    email: ngo.email,
                    responseTime: '24-48 hours'
                }
            }
        });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

module.exports = {
    MatchNGOFromConversation,
    GetNGORecommendationDetails
};