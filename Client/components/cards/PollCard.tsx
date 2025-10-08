import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTTS } from '../../hooks/useTTS';

const { width } = Dimensions.get('window');

interface PollCardProps {
  poll: any;
  onVote?: (pollId: string, optionIndex: number, userId: string) => void;
  onEdit?: (poll: any) => void;
  onDelete?: (pollId: string, pollTopic: string) => void;
  userId?: string;
  isPreview?: boolean;
  canEdit?: boolean;
  isGridView?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote, onEdit, onDelete, userId, isPreview = false, canEdit = false, isGridView = false }) => {
  const { theme, colors } = useTheme();
  const { speak, isSpeaking, stopSpeaking } = useTTS();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  // Check if user has already voted (in a real app, this would come from the poll data)
  React.useEffect(() => {
    if (poll.voters && userId) {
      const userVote = poll.voters.find((voter: any) => voter.userId === userId);
      if (userVote) {
        setHasVoted(true);
        setSelectedOption(userVote.selectedOption);
      }
    }
  }, [poll, userId]);

  const handleVote = async (optionIndex: number) => {
    if (!userId) {
      Alert.alert('Error', 'Please log in to vote');
      return;
    }

    if (hasVoted) {
      Alert.alert('Info', 'You have already voted on this poll');
      return;
    }

    if (isPreview) {
      // In preview mode, just show the selection
      setSelectedOption(optionIndex);
      return;
    }

    setIsVoting(true);
    try {
      if (onVote) {
        await onVote(poll._id, optionIndex, userId);
        setHasVoted(true);
        setSelectedOption(optionIndex);
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const getOptionPercentage = (optionIndex: number) => {
    if (!poll.totalVotes || poll.totalVotes === 0) return 0;
    return ((poll.votes[optionIndex] || 0) / poll.totalVotes) * 100;
  };

  const handleSpeakTopic = async () => {
    if (isSpeaking) {
      await stopSpeaking();
    } else {
      const textToSpeak = `Poll: ${poll.topic}`;
      await speak(textToSpeak);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Family Law': '👨‍👩‍👧‍👦',
      'Property Law': '🏠',
      'Employment Law': '💼',
      'Civil Law': '⚖️',
      'Criminal Law': '🚔',
      'All': '📋'
    };
    return icons[category] || '📋';
  };

  // Create dynamic styles based on theme
  const styles = createStyles(colors, theme, isGridView);

  return (
    <View style={styles.pollCard}>
      {/* Header */}
      <View style={styles.pollHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(poll.category)}</Text>
            <Text style={styles.categoryText}>{poll.category}</Text>
          </View>
          <Text style={styles.authorName}>{poll.author}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(poll.createdAt)}</Text>
        </View>
        <View style={styles.pollActions}>
          {/* Edit and Delete Buttons - Only show for polls by current user */}
          {canEdit && onEdit && onDelete ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  console.log('Edit button clicked for poll:', poll);
                  onEdit(poll);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked for poll:', poll);
                  onDelete(poll._id || poll.id, poll.topic);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            (() => {
              console.log('Edit buttons not shown - canEdit:', canEdit, 'onEdit:', !!onEdit, 'onDelete:', !!onDelete);
              return null;
            })()
          )}
        </View>
      </View>

      {/* Poll Topic with Speaker Icon */}
      <View style={styles.topicContainer}>
        <Text style={styles.pollTopic}>{poll.topic}</Text>
        <TouchableOpacity
          style={styles.speakerButton}
          onPress={handleSpeakTopic}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isSpeaking ? "stop-circle" : "volume-high"} 
            size={20} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Poll Options */}
      <View style={styles.optionsContainer}>
        {poll.options?.map((option: string, index: number) => {
          const percentage = getOptionPercentage(index);
          const votes = poll.votes?.[index] || 0;
          const isSelected = selectedOption === index;
          const showResults = hasVoted || isPreview;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                hasVoted && !isSelected && styles.unselectedOption
              ]}
              onPress={() => handleVote(index)}
              disabled={hasVoted && !isPreview}
              activeOpacity={hasVoted ? 1 : 0.7}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                  hasVoted && !isSelected && styles.unselectedOptionText
                ]}>
                  {option}
                </Text>
                
                {showResults && (
                  <View style={styles.resultInfo}>
                    <Text style={[
                      styles.voteCount,
                      isSelected && styles.selectedVoteCount
                    ]}>
                      {votes} vote{votes !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </Text>
                  </View>
                )}
              </View>
              
              {showResults && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      isSelected && styles.selectedProgressBar,
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
              )}

            </TouchableOpacity>
          );
        })}
      </View>

      {/* Poll Stats */}
      <View style={styles.pollStats}>
        <Text style={styles.totalVotes}>
          {poll.totalVotes || 0} total vote{(poll.totalVotes || 0) !== 1 ? 's' : ''}
        </Text>
        {hasVoted && (
          <Text style={styles.votedIndicator}>✓ You voted</Text>
        )}
      </View>

      {isVoting && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Casting vote...</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any, theme: string, isGridView: boolean = false) => StyleSheet.create({
  pollCard: {
    backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
    borderRadius: isGridView ? 12 : 16,
    padding: isGridView ? 12 : 20,
    marginBottom: isGridView ? 0 : 16,
    marginTop: isGridView ? 0 : 0,
    marginHorizontal: isGridView ? 0 : 0,
    shadowColor: theme === 'dark' ? colors.primary : '#000',
    shadowOffset: { width: 0, height: isGridView ? 2 : 4 },
    shadowOpacity: isGridView ? 0.1 : 0.12,
    shadowRadius: isGridView ? 4 : 12,
    elevation: isGridView ? 2 : 6,
    minHeight: isGridView ? 'auto' : 'auto',
    borderWidth: 1,
    borderColor: theme === 'dark' ? colors.secondary : isGridView ? '#F0F0F0' : '#F0F2FF',
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? colors.secondary : '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    color: theme === 'dark' ? colors.primary : '#666666',
    fontWeight: '500',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: theme === 'dark' ? colors.darkgray : '#7F8C8D',
  },
  pollActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButton: {
    backgroundColor: 'rgba(255, 113, 0, 0.1)',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 113, 0, 0.3)',
  },
  editIcon: {
    fontSize: 12,
    color: '#ff7100',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  deleteIcon: {
    fontSize: 12,
    color: '#ff6b6b',
  },
  pollTopic: {
    fontSize: isGridView ? 14 : 16,
    fontWeight: '600',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    lineHeight: isGridView ? 18 : 22,
    flex: 1,
    minHeight: isGridView ? 36 : 'auto', // Ensure consistent height in grid
  },
  optionsContainer: {
    marginBottom: isGridView ? 12 : 16,
  },
  optionButton: {
    backgroundColor: theme === 'dark' ? colors.secondary : '#F8F9FA',
    borderRadius: isGridView ? 8 : 12,
    padding: isGridView ? 10 : 16,
    marginBottom: isGridView ? 6 : 8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOption: {
    backgroundColor: '#ff7100',
    borderColor: '#ff7100',
  },
  unselectedOption: {
    backgroundColor: theme === 'dark' ? colors.secondary : '#F8F9FA',
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  optionText: {
    fontSize: isGridView ? 12 : 15,
    fontWeight: '500',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    flex: 1,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unselectedOptionText: {
    color: theme === 'dark' ? colors.darkgray : '#7F8C8D',
  },
  resultInfo: {
    alignItems: 'flex-end',
  },
  voteCount: {
    fontSize: 12,
    color: theme === 'dark' ? colors.darkgray : '#666666',
    fontWeight: '500',
  },
  selectedVoteCount: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 113, 0, 0.2)',
    borderRadius: 12,
  },
  selectedProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pollStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? colors.darkgray : '#F0F0F0',
  },
  totalVotes: {
    fontSize: 13,
    color: theme === 'dark' ? colors.darkgray : '#7F8C8D',
    fontWeight: '500',
  },
  votedIndicator: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme === 'dark' ? 'rgba(23, 21, 47, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#ff7100',
    fontWeight: '600',
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: isGridView ? 12 : 16,
  },
  speakerButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255, 113, 0, 0.1)' : 'rgba(255, 113, 0, 0.1)',
    marginLeft: 8,
    marginTop: -2,
  },
});

export default PollCard;
