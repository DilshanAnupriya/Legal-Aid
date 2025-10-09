import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTTS } from '../../hooks/useTTS';

interface PostDetailModalProps {
  visible: boolean;
  post: any;
  onClose: () => void;
  onPostUpdated?: () => void; // Callback to refresh parent data
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ visible, post, onClose, onPostUpdated }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const { speak, isSpeaking, stopSpeaking } = useTTS();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{id: string, content: string} | null>(null);

  // API URL configuration
  const getApiUrls = () => {
    if (Platform.OS === 'web') {
      return [
        'http://localhost:3000/api',
        'http://127.0.0.1:3000/api',
      ];
    } else if (Platform.OS === 'android') {
      return [
        'http://10.0.2.2:3000/api',     // Android emulator
        'http://10.4.2.1:3000/api',    // Your computer's IP
        'http://localhost:3000/api',    // Fallback
      ];
    } else {
      // iOS simulator
      return [
        'http://10.4.2.1:3000/api',    // Your computer's IP
        'http://localhost:3000/api',    // iOS simulator
      ];
    }
  };

  const API_URLS = getApiUrls();

  const [currentApiIndex, setCurrentApiIndex] = useState(0);
  const BASE_URL = API_URLS[currentApiIndex];

  // Try next API URL if current one fails
  const tryNextApiUrl = () => {
    const nextIndex = (currentApiIndex + 1) % API_URLS.length;
    console.log(`[PostDetailModal] Trying next API URL: ${API_URLS[nextIndex]}`);
    setCurrentApiIndex(nextIndex);
    return nextIndex !== currentApiIndex; // Return false if we've tried all URLs
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastActivity = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      if (diffInDays === 1) {
        return t('postDetail.timeAgo.oneDay', { defaultValue: '1 day ago' });
      }
      return t('postDetail.timeAgo.days', { 
        count: diffInDays, 
        defaultValue: `${diffInDays} days ago`
      });
    } else if (diffInHours > 0) {
      if (diffInHours === 1) {
        return t('postDetail.timeAgo.oneHour', { defaultValue: '1 hour ago' });
      }
      return t('postDetail.timeAgo.hours', { 
        count: diffInHours, 
        defaultValue: `${diffInHours} hours ago`
      });
    } else {
      return t('postDetail.timeAgo.justNow', { defaultValue: 'Just now' });
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (isAnonymousComment) {
      return t('postDetail.anonymousUser', { defaultValue: 'Anonymous User' });
    }
    
    if (user?.email) {
      // Extract name part from email (before @ symbol) and capitalize
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return t('postDetail.defaultUser', { defaultValue: 'User' }); // Fallback if no user info
  };

  // Helper function to translate category names
  const translateCategory = (category: string) => {
    switch (category) {
      case 'Family Law':
        return t('categories.familyLaw', { defaultValue: 'Family Law' });
      case 'Property Law':
        return t('categories.propertyLaw', { defaultValue: 'Property Law' });
      case 'Employment Law':
        return t('categories.employmentLaw', { defaultValue: 'Employment Law' });
      case 'Civil Law':
        return t('categories.civilLaw', { defaultValue: 'Civil Law' });
      case 'Criminal Law':
        return t('categories.criminalLaw', { defaultValue: 'Criminal Law' });
      default:
        return category; // Return original if no translation found
    }
  };

  // Helper function to check if current user can delete the comment
  const canDeleteComment = (commentAuthor: string) => {
    if (!user?.email) return false;
    
    // Get current user's display name (same logic as getUserDisplayName)
    const currentUserDisplayName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
    
    // Check if the comment author matches current user and is not anonymous
    return commentAuthor === currentUserDisplayName && commentAuthor !== 'Anonymous User';
  };

  // Load comments when modal opens
  useEffect(() => {
    if (visible && post) {
      fetchComments();
    }
  }, [visible, post]);

  const fetchComments = async () => {
    if (!post?._id) return;
    
    try {
      setCommentsLoading(true);
      console.log('Fetching comments for post:', post._id);
      
      const response = await fetch(`${BASE_URL}/posts/${post._id}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Comments response:', data);

      if (data.success) {
        // Transform backend comment data to match frontend format
        const transformedComments = data.data.comments.map((comment: any) => ({
          id: comment._id,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt,
          isAnonymous: comment.isAnonymous,
        }));
        setComments(transformedComments);
      } else {
        console.error('Failed to fetch comments:', data.message);
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Validation Error', 'Please enter a comment');
      return;
    }

    if (!user?.email) {
      Alert.alert('Authentication Required', 'Please log in to add a comment');
      return;
    }

    try {
      setAddingComment(true);

      const commentData = {
        content: newComment.trim(),
        author: getUserDisplayName(),
        authorEmail: user?.email, // Add email for notifications
        isAnonymous: isAnonymousComment,
      };

      console.log('Adding comment:', commentData);

      const response = await fetch(`${BASE_URL}/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Add comment response:', data);

      if (data.success) {
        // Reset form
        setNewComment('');
        setIsAnonymousComment(false);

        // Refresh comments to show the new comment
        await fetchComments();

        // Notify parent component to refresh post data (for reply count update)
        if (onPostUpdated) {
          onPostUpdated();
        }

        Alert.alert('Success', 'Comment added successfully!');
      } else {
        throw new Error(data.message || 'Failed to add comment');
      }

    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setAddingComment(false);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(currentContent);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) {
      Alert.alert('Validation Error', 'Please enter comment content');
      return;
    }

    try {
      console.log('Updating comment:', commentId);
      
      const response = await fetch(`${BASE_URL}/posts/comments/${commentId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editingCommentContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Update comment response:', data);

      if (data.success) {
        // Refresh comments to show the updated comment
        await fetchComments();
        
        // Notify parent component to refresh post data
        if (onPostUpdated) {
          onPostUpdated();
        }
        
        // Reset editing state
        setEditingCommentId(null);
        setEditingCommentContent('');
        
        Alert.alert('Success', 'Comment updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      Alert.alert('Error', 'Failed to update comment. Please try again.');
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const deleteComment = async (commentId: string) => {
    try {
      console.log('Deleting comment:', commentId);
      
      const response = await fetch(`${BASE_URL}/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete comment response:', data);

      if (data.success) {
        console.log('Comment deleted successfully');
        // Refresh comments to remove the deleted comment
        await fetchComments();
        
        // Notify parent component to refresh post data (for reply count update)
        if (onPostUpdated) {
          onPostUpdated();
        }
      } else {
        console.error('Failed to delete comment:', data.message);
        // For web compatibility, use console.error instead of Alert
        if (Platform.OS === 'web') {
          console.error('Delete failed:', data.message || 'Failed to delete comment');
        } else {
          Alert.alert('Error', data.message || 'Failed to delete comment');
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      // For web compatibility, use console.error instead of Alert
      if (Platform.OS === 'web') {
        console.error('Delete failed:', error instanceof Error ? error.message : 'Unknown error');
      } else {
        Alert.alert('Error', 'Failed to delete comment. Please try again.');
      }
    }
  };

  const handleDeleteComment = (commentId: string, commentContent: string) => {
    setCommentToDelete({ id: commentId, content: commentContent });
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete.id);
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  // Handle speaking description
  const handleSpeakDescription = async () => {
    if (isSpeaking) {
      await stopSpeaking();
    } else {
      const textToSpeak = `Description: ${post.description}`;
      await speak(textToSpeak);
    }
  };

  // Don't render anything if no post data
  if (!visible || !post) {
    return null;
  }

  const styles = createStyles(colors);

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('postDetail.title', { defaultValue: 'Post Details' })}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Title */}
          <View style={styles.titleSection}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <View style={styles.titleMeta}>
              {post.isAnswered && (
                <View style={styles.answeredBadge}>
                  <Text style={styles.answeredIcon}>✓</Text>
                  <Text style={styles.answeredText}>{t('postDetail.answered', { defaultValue: 'Answered' })}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Post Meta Information */}
          <View style={styles.metaSection}>
            <View style={styles.authorInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{post.author.charAt(0)}</Text>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👁</Text>
                <Text style={styles.statNumber}>{post.views}</Text>
                <Text style={styles.statLabel}>{t('postDetail.stats.views', { defaultValue: 'Views' })}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💬</Text>
                <Text style={styles.statNumber}>{post.replies}</Text>
                <Text style={styles.statLabel}>{t('postDetail.stats.replies', { defaultValue: 'Replies' })}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🕒</Text>
                <Text style={styles.statNumber}>{formatLastActivity(post.lastActivity)}</Text>
                <Text style={styles.statLabel}>{t('postDetail.stats.lastActivity', { defaultValue: 'Last Activity' })}</Text>
              </View>
            </View>
          </View>

          {/* Category */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>{t('postDetail.category', { defaultValue: 'Category' })}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{translateCategory(post.category)}</Text>
            </View>
          </View>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionLabel}>{t('postDetail.tags', { defaultValue: 'Tags' })}</Text>
              <View style={styles.tagsContainer}>
                {post.tags.map((tag: string, index: number) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>{t('postDetail.description', { defaultValue: 'Description' })}</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{post.description}</Text>
              <TouchableOpacity
                style={styles.descriptionSpeakerButton}
                onPress={handleSpeakDescription}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isSpeaking ? "stop-circle" : "volume-high"} 
                  size={22} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Information */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionLabel}>{t('postDetail.status.label', { defaultValue: 'Status' })}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>{t('postDetail.status.status', { defaultValue: 'Status' })}:</Text>
                <Text style={[styles.statusValue, { color: post.status === 'active' ? '#6BCF7F' : '#FF6B6B' }]}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>{t('postDetail.status.anonymous', { defaultValue: 'Anonymous' })}:</Text>
                <Text style={styles.statusValue}>
                  {post.isAnonymous ? t('common.yes', { defaultValue: 'Yes' }) : t('common.no', { defaultValue: 'No' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.timestampsSection}>
            <Text style={styles.sectionLabel}>{t('postDetail.timeline', { defaultValue: 'Timeline' })}</Text>
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>{t('postDetail.created', { defaultValue: 'Created' })}:</Text>
              <Text style={styles.timestampValue}>{formatDate(post.createdAt)}</Text>
            </View>
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>{t('postDetail.lastUpdated', { defaultValue: 'Last Updated' })}:</Text>
              <Text style={styles.timestampValue}>{formatDate(post.updatedAt)}</Text>
            </View>
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>{t('postDetail.lastActivity', { defaultValue: 'Last Activity' })}:</Text>
              <Text style={styles.timestampValue}>{formatDate(post.lastActivity)}</Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionLabel}>{t('postDetail.comments.title', { count: comments.length, defaultValue: `Comments (${comments.length})` })}</Text>
            
            {/* Existing Comments */}
            {commentsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="colors.primary" />
                <Text style={styles.loadingText}>{t('postDetail.comments.loading', { defaultValue: 'Loading comments...' })}</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>{t('postDetail.comments.noComments', { defaultValue: 'No comments yet' })}</Text>
                <Text style={styles.noCommentsSubtext}>{t('postDetail.comments.beFirst', { defaultValue: 'Be the first to share your thoughts!' })}</Text>
              </View>
            ) : (
              comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAuthor}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.author.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.commentAuthorInfo}>
                      <Text style={styles.commentAuthorName}>{comment.author}</Text>
                      <Text style={styles.commentDate}>
                        {formatLastActivity(comment.createdAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.commentActions}>
                    {comment.isAnonymous && (
                      <View style={styles.anonymousBadge}>
                        <Text style={styles.anonymousText}>{t('postDetail.anonymous', { defaultValue: 'Anonymous' })}</Text>
                      </View>
                    )}
                    
                    {/* Edit and Delete Buttons - Only show for comments by current user */}
                    {canDeleteComment(comment.author) && (
                      <>
                        <TouchableOpacity
                          style={styles.editCommentButton}
                          onPress={() => handleEditComment(comment.id, comment.content)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.editCommentIcon}>✏️</Text>
                        </TouchableOpacity>
                        <Pressable
                          style={({ pressed }) => [
                            styles.deleteCommentButton,
                            { opacity: pressed ? 0.7 : 1 }
                          ]}
                          onPress={() => handleDeleteComment(comment.id, comment.content)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.deleteCommentIcon}>🗑️</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
                
                {/* Comment Content or Edit Input */}
                {editingCommentId === comment.id ? (
                  <View style={styles.editCommentContainer}>
                    <TextInput
                      style={styles.editCommentInput}
                      value={editingCommentContent}
                      onChangeText={setEditingCommentContent}
                      multiline={true}
                      autoFocus={true}
                      maxLength={500}
                    />
                    <Text style={styles.editCharacterCount}>{editingCommentContent.length}/500</Text>
                    <View style={styles.editCommentActions}>
                      <TouchableOpacity
                        style={styles.cancelEditButton}
                        onPress={handleCancelEditComment}
                      >
                        <Text style={styles.cancelEditText}>{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveEditButton}
                        onPress={() => handleSaveEditComment(comment.id)}
                      >
                        <Text style={styles.saveEditText}>{t('common.save', { defaultValue: 'Save' })}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.commentContent}>{comment.content}</Text>
                )}
              </View>
              ))
            )}

            {/* Add Comment Form */}
            <View style={styles.addCommentSection}>
              <Text style={styles.addCommentLabel}>{t('postDetail.comments.addComment', { defaultValue: 'Add a Comment' })}</Text>
              
              {/* Show current user info */}
              {user?.email && (
                <View style={styles.currentUserInfo}>
                  <Text style={styles.currentUserLabel}>
                    {t('postDetail.comments.commentingAs', { defaultValue: 'Commenting as' })}: <Text style={styles.currentUserName}>{getUserDisplayName()}</Text>
                  </Text>
                </View>
              )}

              {/* Comment Input */}
              <TextInput
                style={styles.commentInput}
                placeholder={t('postDetail.comments.placeholder', { defaultValue: 'Share your thoughts, advice, or experience...' })}
                placeholderTextColor="#999999"
                value={newComment}
                onChangeText={setNewComment}
                multiline={true}
                textAlignVertical="top"
                maxLength={500}
              />

              {/* Character Count */}
              <Text style={styles.characterCount}>{newComment.length}/500</Text>

              {/* Anonymous Option */}
              <TouchableOpacity
                style={styles.anonymousOption}
                onPress={() => setIsAnonymousComment(!isAnonymousComment)}>
                <View style={[styles.checkbox, isAnonymousComment && styles.checkboxChecked]}>
                  {isAnonymousComment && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.anonymousOptionLabel}>{t('postDetail.comments.commentAnonymously', { defaultValue: 'Comment anonymously' })}</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitCommentButton, addingComment && styles.submitCommentButtonDisabled]}
                onPress={handleAddComment}
                disabled={addingComment}>
                {addingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitCommentButtonText}>{t('postDetail.comments.submitButton', { defaultValue: 'Add Comment' })}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>

    {/* Delete Comment Confirmation Modal */}
    <Modal
      visible={showDeleteCommentModal}
      transparent={true}
      animationType="fade"
      onRequestClose={cancelDeleteComment}
    >
      <View style={styles.deleteCommentModalOverlay}>
        <View style={styles.deleteCommentModalContainer}>
          <Text style={styles.deleteCommentModalTitle}>{t('postDetail.deleteModal.title', { defaultValue: 'Delete Comment' })}</Text>
          <Text style={styles.deleteCommentModalMessage}>
            {t('postDetail.deleteModal.message', { defaultValue: 'Are you sure you want to delete this comment?' })}
            {commentToDelete && commentToDelete.content && (
              <>
                {'\n\n"'}
                {commentToDelete.content.length > 100 
                  ? commentToDelete.content.substring(0, 100) + '...' 
                  : commentToDelete.content
                }
                {'"'}
              </>
            )}
            {'\n\n'}{t('postDetail.deleteModal.warning', { defaultValue: 'This action cannot be undone.' })}
          </Text>
          <View style={styles.deleteCommentModalButtons}>
            <TouchableOpacity
              style={styles.deleteCommentModalCancelButton}
              onPress={cancelDeleteComment}
            >
              <Text style={styles.deleteCommentModalCancelText}>{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteCommentModalConfirmButton}
              onPress={confirmDeleteComment}
            >
              <Text style={styles.deleteCommentModalConfirmText}>{t('common.delete', { defaultValue: 'Delete' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    lineHeight: 32,
    marginBottom: 15,
  },
  titleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6BCF7F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  answeredIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 4,
  },
  answeredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tagsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  descriptionText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    flex: 1,
    marginRight: 12,
  },
  descriptionSpeakerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  timestampsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  timestampItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timestampLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  bottomSpacing: {
    height: 40,
  },
  // Comments Section Styles
  commentsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  commentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  commentContent: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  anonymousBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anonymousText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  editCommentButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    padding: 6,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  editCommentIcon: {
    fontSize: 12,
    color: colors.primary,
  },
  deleteCommentButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    zIndex: 10,
    elevation: 3,
    // Ensure it's clickable on web
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      userSelect: 'none',
    }),
  },
  deleteCommentIcon: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  editCommentContainer: {
    marginTop: 10,
  },
  editCommentInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: colors.primary,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  editCharacterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelEditButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelEditText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  saveEditButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveEditText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  currentUserInfo: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  currentUserLabel: {
    fontSize: 14,
    color: '#2C3E50',
  },
  currentUserName: {
    fontWeight: '600',
    color: colors.primary,
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 10,
  },
  addCommentSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addCommentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  nameInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    maxHeight: 150,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginBottom: 15,
  },
  anonymousOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  anonymousOptionLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  submitCommentButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitCommentButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitCommentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Delete Comment Modal Styles
  deleteCommentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20000, // Higher than post delete modal
  },
  deleteCommentModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15, // Higher elevation
  },
  deleteCommentModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteCommentModalMessage: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteCommentModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteCommentModalCancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteCommentModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  deleteCommentModalConfirmButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteCommentModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PostDetailModal;
