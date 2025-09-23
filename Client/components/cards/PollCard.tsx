import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface PollCardProps {
  poll: any;
  onVote?: (pollId: string, optionIndex: number, userId: string) => void;
  userId?: string;
  isPreview?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote, userId, isPreview = false }) => {
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
        <View style={styles.pollBadge}>
          <Text style={styles.pollBadgeText}>📊 POLL</Text>
        </View>
      </View>

      {/* Poll Topic */}
      <Text style={styles.pollTopic}>{poll.topic}</Text>

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

              {isSelected && hasVoted && (
                <View style={styles.checkMark}>
                  <Text style={styles.checkMarkText}>✓</Text>
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

const styles = StyleSheet.create({
  pollCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    backgroundColor: '#F8F9FA',
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
    color: '#666666',
    fontWeight: '500',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  pollBadge: {
    backgroundColor: '#f093fb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pollBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pollTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOption: {
    backgroundColor: '#f093fb',
    borderColor: '#f093fb',
  },
  unselectedOption: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unselectedOptionText: {
    color: '#7F8C8D',
  },
  resultInfo: {
    alignItems: 'flex-end',
  },
  voteCount: {
    fontSize: 12,
    color: '#666666',
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
    backgroundColor: 'rgba(240, 147, 251, 0.2)',
    borderRadius: 12,
  },
  selectedProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkMark: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  checkMarkText: {
    fontSize: 12,
    color: '#f093fb',
    fontWeight: 'bold',
  },
  pollStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalVotes: {
    fontSize: 13,
    color: '#7F8C8D',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#f093fb',
    fontWeight: '600',
  },
});

export default PollCard;
