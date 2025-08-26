const Post = require('../models/Post');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, description, tags, isAnonymous, category, priority } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Determine author name
    const author = isAnonymous ? 'Anonymous User' : (req.body.author || 'Anonymous User');

    // Determine category from tags if not provided
    let postCategory = category || 'All';
    if (!category && tags && tags.length > 0) {
      const categoryMapping = {
        'family': 'Family Law',
        'property': 'Property Law',
        'employment': 'Employment Law',
        'civil': 'Civil Law',
        'criminal': 'Criminal Law'
      };
      
      for (const tag of tags) {
        const lowerTag = tag.toLowerCase();
        for (const [key, value] of Object.entries(categoryMapping)) {
          if (lowerTag.includes(key)) {
            postCategory = value;
            break;
          }
        }
        if (postCategory !== 'All') break;
      }
    }

    // Create new post
    const newPost = new Post({
      title,
      description,
      author,
      tags: tags || [],
      category: postCategory,
      isAnonymous: isAnonymous || false,
      priority: priority || 'medium'
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: savedPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all posts with filtering and pagination
const getPosts = async (req, res) => {
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get posts with pagination
    const posts = await Post.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.createdAt;
    delete updates.views;
    delete updates.replies;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a post (soft delete)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndUpdate(
      id,
      { status: 'deleted', updatedAt: Date.now() },
      { new: true }
    );

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get post statistics
const getPostStats = async (req, res) => {
  try {
    const stats = await Post.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalReplies: { $sum: '$replies' },
          answeredPosts: {
            $sum: { $cond: [{ $eq: ['$isAnswered', true] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Post.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = stats[0] || {
      totalPosts: 0,
      totalViews: 0,
      totalReplies: 0,
      answeredPosts: 0
    };

    result.answerRate = result.totalPosts > 0 
      ? Math.round((result.answeredPosts / result.totalPosts) * 100) 
      : 0;
    result.categoryBreakdown = categoryStats;

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching post stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostStats
};