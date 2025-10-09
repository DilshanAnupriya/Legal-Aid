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
                urgencyLevel: analysis.urgency,
                categoryScores: analysis.categoryScores
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

    const categoryScores = {};
    const keywords = [];
    let urgency = 'normal';

    // Category detection with keywords and weights (FIXED VERSION)
    const categoryPatterns = {
        'LGBTQ+ Rights': {
            highPriority: [
                'lgbtq', 'lgbt', 'lgbtq+', 'lgbtqia', 'gay rights', 'lesbian rights',
                'transgender rights', 'queer rights', 'same-sex marriage', 'same sex marriage',
                'pride', 'coming out', 'homophobia', 'transphobia', 'sexual minority',
                'gender non-conforming'
            ],
            mediumPriority: [
                'gay', 'lesbian', 'transgender', 'trans', 'bisexual', 'queer',
                'sexual orientation', 'gender identity', 'same-sex', 'same sex',
                'non-binary', 'nonbinary', 'gender expression', 'homosexual'
            ],
            weight: 15 // Higher weight for LGBTQ+ to prioritize it
        },
        'Women\'s Rights & Gender Justice': {
            highPriority: [
                'women rights', 'women\'s rights', 'gender equality', 'feminist',
                'sexual harassment', 'domestic violence', 'rape case', 'dowry case',
                'sexual assault', 'dowry', 'maternity rights', 'gender-based violence'
            ],
            mediumPriority: [
                'women', 'female', 'girl', 'mother', 'maternity', 'pregnancy',
                'equal pay', 'workplace harassment', 'gender discrimination', 'lady'
            ],
            weight: 10
        },
        'Child Protection': {
            highPriority: [
                'child abuse', 'child labor', 'child rights', 'child welfare',
                'child protection', 'child custody', 'child marriage', 'minor abuse'
            ],
            mediumPriority: [
                'child', 'children', 'minor', 'custody', 'adoption', 'kid',
                'education rights', 'guardian', 'juvenile', 'underage', 'school'
            ],
            weight: 10
        },
        'Labor & Employment Rights': {
            highPriority: [
                'labor rights', 'employment rights', 'worker rights', 'labour rights',
                'workplace discrimination', 'unfair dismissal', 'wage theft', 'labor law'
            ],
            mediumPriority: [
                'employment', 'labor', 'labour', 'worker', 'job', 'salary', 'wage',
                'workplace', 'termination', 'fired', 'contract', 'overtime',
                'benefits', 'pension', 'layoff', 'employer', 'employee'
            ],
            weight: 8
        },
        'Refugee & Migrant Rights': {
            highPriority: [
                'refugee rights', 'asylum seeker', 'migrant rights', 'refugee status',
                'deportation', 'immigration law', 'asylum law'
            ],
            mediumPriority: [
                'refugee', 'asylum', 'immigrant', 'migrant', 'visa',
                'citizenship', 'stateless', 'border', 'foreign worker',
                'migration', 'displaced'
            ],
            weight: 10
        },
        'Human Rights & Civil Liberties': {
            highPriority: [
                'human rights', 'civil liberties', 'civil rights', 'human rights violation',
                'constitutional rights', 'freedom of speech', 'police brutality',
                'wrongful arrest'
            ],
            mediumPriority: [
                'freedom', 'discrimination', 'police', 'arrest',
                'detention', 'torture', 'abuse', 'privacy', 'speech', 'liberty'
            ],
            weight: 7
        }
    };

    // Score each category based on keyword matches with weighted scoring
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
        let score = 0;
        const foundKeywords = [];

        // Check high priority keywords (15 points each)
        patterns.highPriority.forEach(pattern => {
            if (fullText.includes(pattern)) {
                score += 15 * patterns.weight;
                foundKeywords.push(pattern);
            }
        });

        // Check medium priority keywords (3 points each)
        patterns.mediumPriority.forEach(pattern => {
            if (fullText.includes(pattern)) {
                score += 3 * patterns.weight;
                foundKeywords.push(pattern);
            }
        });

        if (score > 0) {
            categoryScores[category] = score;
            keywords.push(...foundKeywords);
        }
    }

    // Get categories sorted by score (highest first)
    const categories = Object.entries(categoryScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .map(([category]) => category);

    // Detect urgency
    const urgentKeywords = [
        'urgent', 'emergency', 'immediate', 'help now', 'asap',
        'crisis', 'danger', 'threat', 'violence', 'severe'
    ];

    if (urgentKeywords.some(keyword => fullText.includes(keyword))) {
        urgency = 'high';
    }

    // Remove duplicate keywords
    const uniqueKeywords = [...new Set(keywords)];

    // If no strong matches found, return general legal aid
    const finalCategories = categories.length > 0 ? categories : ['General Legal Aid'];

    console.log('=== NGO MATCHING DEBUG ===');
    console.log('Search text:', fullText);
    console.log('Category Scoring:', categoryScores);
    console.log('Final Categories (ordered by relevance):', finalCategories);
    console.log('Found Keywords:', uniqueKeywords);
    console.log('========================');

    return {
        categories: finalCategories,
        keywords: uniqueKeywords,
        urgency,
        messageCount: conversationHistory.length,
        categoryScores // Return for debugging
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
        .limit(20); // Get more results for better filtering

    console.log(`Found ${ngos.length} matching NGOs for categories:`, analysis.categories);

    return ngos;
}

// Rank NGOs by relevance to conversation
function rankNGOsByRelevance(ngos, analysis) {
    return ngos.map(ngo => {
        let relevanceScore = 0;

        // Category match with position-based scoring (HIGHEST PRIORITY)
        const categoryIndex = analysis.categories.indexOf(ngo.category);
        if (categoryIndex !== -1) {
            // First category gets 200 points, second gets 120, third gets 60
            const categoryScores = [200, 120, 60, 30, 15];
            relevanceScore += categoryScores[categoryIndex] || 10;
        }

        // Keyword matching in description and name
        const ngoText = (ngo.name + ' ' + ngo.description).toLowerCase();
        const keywordMatches = analysis.keywords.filter(keyword =>
            ngoText.includes(keyword)
        ).length;
        relevanceScore += keywordMatches * 5;

        // Rating boost (higher rated NGOs get preference)
        relevanceScore += ngo.rating * 10;

        // Urgency handling - prioritize higher-rated NGOs for urgent cases
        if (analysis.urgency === 'high' && ngo.rating >= 4) {
            relevanceScore += 25;
        }

        console.log(`NGO: ${ngo.name}, Category: ${ngo.category}, Score: ${relevanceScore}`);

        return {
            ...ngo.toObject(),
            relevanceScore,
            matchReason: generateMatchReason(ngo, analysis, categoryIndex)
        };
    })
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Generate human-readable match reason
function generateMatchReason(ngo, analysis, categoryIndex) {
    const reasons = [];

    if (categoryIndex === 0) {
        reasons.push(`Perfect match for ${ngo.category}`);
    } else if (categoryIndex === 1) {
        reasons.push(`Strong match for ${ngo.category}`);
    } else if (categoryIndex !== -1) {
        reasons.push(`Specializes in ${ngo.category}`);
    }

    if (ngo.rating >= 4.5) {
        reasons.push('Highly rated');
    } else if (ngo.rating >= 4.0) {
        reasons.push('Well-rated');
    }

    if (analysis.urgency === 'high') {
        reasons.push('Available for urgent cases');
    }

    return reasons.length > 0
        ? reasons.join(' • ')
        : 'Matches your needs';
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