const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('./notificationController');
const { updateLawyerPoints } = require("../utils/lawyerPoints");
const User = require("../models/User");

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, author, isAnonymous,authorEmail } = req.body;

    console.log("req.body in comments : ",req.body)

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

    // ✅ Award points if the commenter is a lawyer
    if (!isAnonymous && authorEmail) {
      const user = await User.findOne({ email: authorEmail });
      if (user && user.role === 'lawyer') {
        const pointsResult = await updateLawyerPoints(user._id, 'forum_reply');
        console.log(`✅ Lawyer comment points updated:`, pointsResult);
      }
    }

    // Create notification if commenter is not the post author
    const commentAuthor = isAnonymous ? 'Anonymous User' : (author || 'Anonymous User');
    const commentAuthorEmail = req.body.authorEmail; // Get commenter's email
    
    
    
    // Only create notification if:
    // 1. Post has an authorEmail (not anonymous)
    // 2. Commenter is not the post author
    // 3. Comment is not anonymous
    if (post.authorEmail && commentAuthorEmail !== post.authorEmail && !isAnonymous) {
      try {
        const notificationData = {
          recipient: post.authorEmail, // Use email instead of display name
          sender: commentAuthor, // Display name for showing in UI
          type: 'comment',
          postId: post._id,
          postTitle: post.title,
          commentContent: content.substring(0, 200), // Truncate to 200 chars
          isRead: false
        };
        console.log('Creating notification with data:', notificationData);
        await createNotification(notificationData);
        console.log(`✅ Notification created successfully for ${post.authorEmail}`);
      } catch (notificationError) {
        // Log error but don't fail the comment creation
        console.error('❌ Error creating notification:', notificationError);
      }
    } else {
      console.log('⚠️ Notification NOT created. Reason:', 
        !post.authorEmail ? 'Post has no authorEmail' :
        commentAuthorEmail === post.authorEmail ? 'Commenter is post author' :
        isAnonymous ? 'Comment is anonymous' : 'Unknown'
      );
    }
    console.log('========================================');

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
