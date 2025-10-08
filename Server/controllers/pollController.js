const Poll = require('../models/Poll');
const { createNotification } = require('./notificationController');

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const { topic, options, isAnonymous, category, author, authorEmail } = req.body;

    // Validation
    if (!topic || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Topic and at least 2 options are required'
      });
    }

    // Validate options
    if (options.some(option => !option || option.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'All options must be non-empty'
      });
    }

    if (options.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 options allowed'
      });
    }

    // Determine author name
    const pollAuthor = isAnonymous ? 'Anonymous User' : (author || 'Anonymous User');

    // Create new poll
    const newPoll = new Poll({
      topic,
      options: options.map(option => option.trim()),
      votes: new Array(options.length).fill(0),
      voters: [],
      totalVotes: 0,
      author: pollAuthor,
      authorEmail: isAnonymous ? null : authorEmail,
      category: category || 'Family Law',
      isAnonymous: isAnonymous || false
    });

    const savedPoll = await newPoll.save();

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: savedPoll
    });

  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all polls with filtering and pagination
const getPolls = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { options: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get polls with pagination
    const polls = await Poll.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalPolls = await Poll.countDocuments(filter);
    const totalPages = Math.ceil(totalPolls / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        polls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPolls,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single poll by ID
const getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: poll
    });

  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Vote on a poll
const voteOnPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex, userId, voterName, voterEmail } = req.body;

    console.log('========== POLL VOTE DEBUG ==========');
    console.log('Poll ID:', id);
    console.log('Voter Email:', voterEmail);
    console.log('Voter Name:', voterName);
    console.log('Option Index:', optionIndex);

    // Validation
    if (optionIndex === undefined || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Option index and user ID are required'
      });
    }

    const poll = await Poll.findById(id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    console.log('Poll Author Email:', poll.authorEmail);
    console.log('Poll Author:', poll.author);
    console.log('Poll is anonymous:', poll.isAnonymous);

    if (poll.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Poll is not active'
      });
    }

    // Check if poll is expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Poll has expired'
      });
    }

    try {
      await poll.vote(userId, parseInt(optionIndex));
      
      // Create notification if voter is not the poll creator
      if (poll.authorEmail && voterEmail !== poll.authorEmail && !poll.isAnonymous) {
        try {
          const selectedOption = poll.options[parseInt(optionIndex)];
          await createNotification({
            recipient: poll.authorEmail,
            sender: voterName || 'Someone',
            type: 'comment', // Reusing comment type for now
            postId: poll._id,
            postTitle: poll.topic,
            commentContent: `Voted for: ${selectedOption}`,
            isRead: false
          });
          console.log(`✅ Notification created for poll creator ${poll.authorEmail}`);
        } catch (notificationError) {
          console.error('❌ Error creating notification:', notificationError);
        }
      } else {
        console.log('⚠️ Notification NOT created. Reason:', 
          !poll.authorEmail ? 'Poll has no authorEmail' :
          voterEmail === poll.authorEmail ? 'Voter is poll creator' :
          poll.isAnonymous ? 'Poll is anonymous' : 'Unknown'
        );
      }
      console.log('====================================');
      
      res.status(200).json({
        success: true,
        message: 'Vote cast successfully',
        data: poll
      });
    } catch (voteError) {
      console.log('====================================');
      return res.status(400).json({
        success: false,
        message: voteError.message
      });
    }

  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get poll results
const getPollResults = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const results = poll.results;

    res.status(200).json({
      success: true,
      data: {
        pollId: poll._id,
        topic: poll.topic,
        totalVotes: poll.totalVotes,
        results: results
      }
    });

  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a poll (close/delete)
const updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expiresAt, topic, category, isAnonymous } = req.body;

    console.log('Update poll request - ID:', id);
    console.log('Update poll request - Body:', req.body);

    const allowedUpdates = ['status', 'expiresAt', 'topic', 'category', 'isAnonymous'];
    const updates = {};

    if (status && ['active', 'closed', 'deleted'].includes(status)) {
      updates.status = status;
    }

    if (expiresAt !== undefined) {
      updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (topic && typeof topic === 'string' && topic.trim().length >= 10) {
      updates.topic = topic.trim();
    }

    if (category && ['All', 'Family Law', 'Property Law', 'Employment Law', 'Civil Law', 'Criminal Law'].includes(category)) {
      updates.category = category;
    }

    if (isAnonymous !== undefined) {
      updates.isAnonymous = isAnonymous;
    }

    console.log('Updates to apply:', updates);

    const poll = await Poll.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );

    console.log('Poll after update:', poll);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Poll updated successfully',
      data: poll
    });

  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a poll
const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByIdAndUpdate(
      id,
      { status: 'deleted' },
      { new: true }
    );

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get poll statistics
const getPollStats = async (req, res) => {
  try {
    const totalPolls = await Poll.countDocuments({ status: 'active' });
    const totalVotes = await Poll.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalVotes: { $sum: '$totalVotes' } } }
    ]);

    const pollsByCategory = await Poll.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentPolls = await Poll.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('topic totalVotes createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalPolls,
        totalVotes: totalVotes[0]?.totalVotes || 0,
        pollsByCategory,
        recentPolls
      }
    });

  } catch (error) {
    console.error('Error fetching poll stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createPoll,
  getPolls,
  getPollById,
  voteOnPoll,
  getPollResults,
  updatePoll,
  deletePoll,
  getPollStats
};
