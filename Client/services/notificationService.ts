import { Platform } from 'react-native';

// Get API URL based on platform
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else if (Platform.OS === 'android') {
    // Try multiple URLs for Android
    return 'http://10.4.2.1:3000/api';
  }
  return 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();

export interface Notification {
  _id: string;
  recipient: string;
  sender: string;
  type: 'comment' | 'reply' | 'mention' | 'like';
  postId: string;
  postTitle: string;
  commentContent: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  count: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

class NotificationService {
  // Get all notifications for a user
  async getUserNotifications(userEmail: string): Promise<Notification[]> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${BASE_URL}/notifications/user/${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NotificationsResponse = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Notification fetch timeout - server may be unreachable');
      } else {
        console.error('Error fetching notifications:', error);
      }
      // Return empty array instead of throwing to prevent UI blocking
      return [];
    }
  }

  // Get unread notification count
  async getUnreadCount(userEmail: string): Promise<number> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${BASE_URL}/notifications/user/${encodeURIComponent(userEmail)}/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UnreadCountResponse = await response.json();
      
      if (result.success) {
        return result.count;
      } else {
        throw new Error('Failed to fetch unread count');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Unread count fetch timeout - server may be unreachable');
      } else {
        console.error('Error fetching unread count:', error);
      }
      return 0; // Return 0 on error to avoid breaking UI
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userEmail: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/notifications/user/${encodeURIComponent(userEmail)}/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Clear all notifications for a user
  async clearAllNotifications(userEmail: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/notifications/user/${encodeURIComponent(userEmail)}/clear-all`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to clear all notifications');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  // Format time ago for notifications
  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return notificationDate.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  }
}

export default new NotificationService();

