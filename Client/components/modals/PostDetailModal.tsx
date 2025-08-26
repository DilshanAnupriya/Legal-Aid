import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

interface PostDetailModalProps {
  visible: boolean;
  post: any;
  onClose: () => void;
}

// Mock comments data - moved outside component to prevent recreation
const mockComments = [
  {
    id: 1,
    author: 'Legal Expert',
    content: 'This is a common issue in property law. I recommend consulting with a local attorney who specializes in boundary disputes.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isAnonymous: false,
  },
  {
    id: 2,
    author: 'Anonymous User',
    content: 'I had a similar problem last year. Make sure you have a proper survey done by a licensed surveyor.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isAnonymous: true,
  },
];

const PostDetailModal: React.FC<PostDetailModalProps> = ({ visible, post, onClose }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [commenterName, setCommenterName] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);

  // API URL configuration
  const API_URLS = Platform.OS === 'android' 
    ? [
        'http://10.0.2.2:3000/api',     // Android emulator
        'http://10.4.2.1:3000/api',    // Your computer's IP
        'http://localhost:3000/api',    // Fallback
      ]
    : [
        'http://10.4.2.1:3000/api',    // Your computer's IP
        'http://localhost:3000/api',    // iOS simulator
      ];

  const [currentApiIndex, setCurrentApiIndex] = useState(0);
  const BASE_URL = API_URLS[currentApiIndex];

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
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD93D';
      case 'low': return '#6BCF7F';
      default: return '#FFD93D';
    }
  };

  const getPriorityText = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };



  // Load comments when modal opens
  useEffect(() => {
    if (visible && post) {
      // For now, use mock data
      setComments(mockComments);
    }
  }, [visible, post]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Validation Error', 'Please enter a comment');
      return;
    }

    if (!isAnonymousComment && !commenterName.trim()) {
      Alert.alert('Validation Error', 'Please enter your name or choose anonymous');
      return;
    }

    try {
      setAddingComment(true);

      // Create new comment object
      const comment = {
        id: comments.length + 1,
        author: isAnonymousComment ? 'Anonymous User' : commenterName,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        isAnonymous: isAnonymousComment,
      };

      // Add to comments list
      setComments([...comments, comment]);

      // Reset form
      setNewComment('');
      setCommenterName('');
      setIsAnonymousComment(false);

      Alert.alert('Success', 'Comment added successfully!');

      // TODO: In the future, send to backend API
      // const response = await fetch(`${BASE_URL}/posts/${post._id}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(comment),
      // });

    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setAddingComment(false);
    }
  };

  // Don't render anything if no post data
  if (!visible || !post) {
    return null;
  }

  return (
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
          <Text style={styles.headerTitle}>Post Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Title */}
          <View style={styles.titleSection}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <View style={styles.titleMeta}>
              <View style={styles.priorityBadge}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(post.priority) }]} />
                <Text style={styles.priorityText}>{getPriorityText(post.priority)} Priority</Text>
              </View>
              {post.isAnswered && (
                <View style={styles.answeredBadge}>
                  <Text style={styles.answeredIcon}>✓</Text>
                  <Text style={styles.answeredText}>Answered</Text>
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
                <Text style={styles.statLabel}>Views</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💬</Text>
                <Text style={styles.statNumber}>{post.replies}</Text>
                <Text style={styles.statLabel}>Replies</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🕒</Text>
                <Text style={styles.statNumber}>{formatLastActivity(post.lastActivity)}</Text>
                <Text style={styles.statLabel}>Last Activity</Text>
              </View>
            </View>
          </View>

          {/* Category */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>
          </View>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionLabel}>Tags</Text>
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
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{post.description}</Text>
          </View>

          {/* Status Information */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[styles.statusValue, { color: post.status === 'active' ? '#6BCF7F' : '#FF6B6B' }]}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Anonymous:</Text>
                <Text style={styles.statusValue}>{post.isAnonymous ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.timestampsSection}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>Created:</Text>
              <Text style={styles.timestampValue}>{formatDate(post.createdAt)}</Text>
            </View>
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>Last Updated:</Text>
              <Text style={styles.timestampValue}>{formatDate(post.updatedAt)}</Text>
            </View>
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>Last Activity:</Text>
              <Text style={styles.timestampValue}>{formatDate(post.lastActivity)}</Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionLabel}>Comments ({comments.length})</Text>
            
            {/* Existing Comments */}
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAuthor}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.author.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.commentAuthorName}>{comment.author}</Text>
                      <Text style={styles.commentDate}>
                        {formatLastActivity(comment.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {comment.isAnonymous && (
                    <View style={styles.anonymousBadge}>
                      <Text style={styles.anonymousText}>Anonymous</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}

            {/* Add Comment Form */}
            <View style={styles.addCommentSection}>
              <Text style={styles.addCommentLabel}>Add a Comment</Text>
              
              {/* Commenter Name Input */}
              {!isAnonymousComment && (
                <TextInput
                  style={styles.nameInput}
                  placeholder="Your name"
                  placeholderTextColor="#999999"
                  value={commenterName}
                  onChangeText={setCommenterName}
                />
              )}

              {/* Comment Input */}
              <TextInput
                style={styles.commentInput}
                placeholder="Share your thoughts, advice, or experience..."
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
                <Text style={styles.anonymousOptionLabel}>Comment anonymously</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitCommentButton, addingComment && styles.submitCommentButtonDisabled]}
                onPress={handleAddComment}
                disabled={addingComment}>
                {addingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitCommentButtonText}>Add Comment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    color: '#667eea',
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
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
    backgroundColor: '#667eea',
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
    backgroundColor: '#667eea',
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
    color: '#667eea',
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
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
    borderLeftColor: '#667eea',
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
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
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
    backgroundColor: '#667eea',
    borderColor: '#667eea',
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
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#667eea',
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
});

export default PostDetailModal;
