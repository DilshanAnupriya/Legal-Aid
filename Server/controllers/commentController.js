const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, author, isAnonymous } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found or inactive'
      });
    }

    // Create new comment
    const newComment = new Comment({
      content,
      author: isAnonymous ? 'Anonymous User' : (author || 'Anonymous User'),
      postId,
      isAnonymous: isAnonymous || false
    });

    const savedComment = await newComment.save();

    // Update post with new comment reference and increment replies count
    await Post.findByIdAndUpdate(
      postId,
      { 
        $push: { comments: savedComment._id },
        $inc: { replies: 1 },
        $set: { lastActivity: Date.now() }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: savedComment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found or inactive'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments for the post
    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments({ postId });

    res.status(200).json({
      success: true,
      data: {
        comments,
        totalComments,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    console.log('[DELETE COMMENT] Request received:', {
      commentId: req.params.commentId,
      method: req.method,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'origin': req.headers.origin
      },
      ip: req.ip
    });

    const { commentId } = req.params;

    if (!commentId) {
      console.log('[DELETE COMMENT] No comment ID provided');
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required'
      });
    }

    console.log('[DELETE COMMENT] Attempting to delete comment with ID:', commentId);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log('[DELETE COMMENT] Comment not found with ID:', commentId);
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    console.log('[DELETE COMMENT] Found comment, removing from post and deleting');

    // Remove comment reference from post and decrement replies count
    await Post.findByIdAndUpdate(
      comment.postId,
      { 
        $pull: { comments: commentId },
        $inc: { replies: -1 },
        $set: { lastActivity: Date.now() }
      }
    );

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    console.log('[DELETE COMMENT] Comment deleted successfully:', commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('[DELETE COMMENT] Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        content: content.trim(),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Update the last activity of the related post
    await Post.findByIdAndUpdate(
      updatedComment.postId,
      { lastActivity: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  updateComment
};
