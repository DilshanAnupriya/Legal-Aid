const Post = require('../models/Post');

class PostService {
  // Validate post data
  static validatePostData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    } else if (data.description.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    if (data.tags && data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get trending topics
  static async getTrendingTopics(limit = 10) {
    try {
      const trendingTags = await Post.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            recentActivity: { $max: '$lastActivity' }
          }
        },
        { $sort: { count: -1, recentActivity: -1 } },
        { $limit: limit },
        {
          $project: {
            name: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      return trendingTags;
    } catch (error) {
      throw new Error('Error fetching trending topics: ' + error.message);
    }
  }

  // Get posts by category with stats
  static async getPostsByCategory() {
    try {
      const categoryStats = await Post.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            answered: {
              $sum: { $cond: [{ $eq: ['$isAnswered', true] }, 1, 0] }
            },
            totalViews: { $sum: '$views' },
            totalReplies: { $sum: '$replies' }
          }
        },
        {
          $project: {
            category: '$_id',
            count: 1,
            answered: 1,
            answerRate: {
              $cond: [
                { $eq: ['$count', 0] },
                0,
                { $multiply: [{ $divide: ['$answered', '$count'] }, 100] }
              ]
            },
            avgViews: { $divide: ['$totalViews', '$count'] },
            avgReplies: { $divide: ['$totalReplies', '$count'] },
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ]);

      return categoryStats;
    } catch (error) {
      throw new Error('Error fetching category stats: ' + error.message);
    }
  }

  // Search posts with advanced filtering
  static async searchPosts(searchQuery, filters = {}) {
    try {
      const {
        category,
        tags,
        isAnswered,
        priority,
        dateFrom,
        dateTo,
        sortBy = 'lastActivity',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = filters;

      // Build search criteria
      const searchCriteria = { status: 'active' };

      // Text search
      if (searchQuery) {
        searchCriteria.$text = { $search: searchQuery };
      }

      // Category filter
      if (category && category !== 'All') {
        searchCriteria.category = category;
      }

      // Tags filter
      if (tags && tags.length > 0) {
        searchCriteria.tags = { $in: tags };
      }

      // Answered filter
      if (typeof isAnswered === 'boolean') {
        searchCriteria.isAnswered = isAnswered;
      }

      // Priority filter
      if (priority) {
        searchCriteria.priority = priority;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        searchCriteria.createdAt = {};
        if (dateFrom) searchCriteria.createdAt.$gte = new Date(dateFrom);
        if (dateTo) searchCriteria.createdAt.$lte = new Date(dateTo);
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find(searchCriteria)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments(searchCriteria);

      return {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPosts: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      };
    } catch (error) {
      throw new Error('Error searching posts: ' + error.message);
    }
  }

  // Get similar posts based on tags
  static async getSimilarPosts(postId, limit = 5) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const similarPosts = await Post.find({
        _id: { $ne: postId },
        status: 'active',
        $or: [
          { tags: { $in: post.tags } },
          { category: post.category }
        ]
      })
      .sort({ views: -1, lastActivity: -1 })
      .limit(limit)
      .lean();

      return similarPosts;
    } catch (error) {
      throw new Error('Error fetching similar posts: ' + error.message);
    }
  }

  // Update post activity
  static async updatePostActivity(postId) {
    try {
      await Post.findByIdAndUpdate(
        postId,
        { lastActivity: Date.now() },
        { new: true }
      );
    } catch (error) {
      throw new Error('Error updating post activity: ' + error.message);
    }
  }

  // Increment post views
  static async incrementPostViews(postId) {
    try {
      await Post.findByIdAndUpdate(
        postId,
        { $inc: { views: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error('Error incrementing post views: ' + error.message);
    }
  }
}

module.exports = PostService;
