/**
 * Real-time collaboration features
 * @mentions, notifications, activity feeds, typing indicators
 */

export interface MentionNotification {
  id: string;
  userId: string;
  mentionedBy: string;
  ticketId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ActivityFeed {
  id: string;
  ticketId: string;
  action: 'created' | 'assigned' | 'commented' | 'status_changed' | 'priority_changed';
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  };
  timestamp: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  ticketId: string;
  timestamp: Date;
}

/**
 * Parse mentions from text
 */
export function parseMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = text.match(mentionRegex) || [];
  return matches.map((match) => match.slice(1)); // Remove @ symbol
}

/**
 * Create mention notifications
 */
export function createMentionNotifications(
  text: string,
  ticketId: string,
  mentionedBy: string,
  mentionedByName: string
): MentionNotification[] {
  const mentions = parseMentions(text);
  return mentions.map((username, idx) => ({
    id: `mention-${Date.now()}-${idx}`,
    userId: username, // In real app, would look up user ID
    mentionedBy,
    ticketId,
    content: `${mentionedByName} mentioned you in a ticket`,
    timestamp: new Date(),
    read: false,
  }));
}

/**
 * Format mentions in text (add links/styling)
 */
export function formatMentionsForDisplay(text: string): string {
  return text.replace(/@([a-zA-Z0-9_-]+)/g, '<a href="/profile/$1" class="mention">@$1</a>');
}

/**
 * Create activity feed entry
 */
export function createActivityFeedEntry(
  ticketId: string,
  action: ActivityFeed['action'],
  actor: ActivityFeed['actor'],
  changes?: ActivityFeed['changes']
): ActivityFeed {
  const descriptions: Record<ActivityFeed['action'], (changes?: any) => string> = {
    created: () => `created this ticket`,
    assigned: (changes) => `assigned this ticket to ${changes?.newValue || 'someone'}`,
    commented: () => `added a comment`,
    status_changed: (changes) => `changed status from ${changes?.oldValue} to ${changes?.newValue}`,
    priority_changed: (changes) =>
      `changed priority from ${changes?.oldValue} to ${changes?.newValue}`,
  };

  return {
    id: `activity-${Date.now()}`,
    ticketId,
    action,
    actor,
    description: descriptions[action](changes),
    changes,
    timestamp: new Date(),
  };
}

/**
 * Get activity feed for ticket
 */
export function generateActivityFeedSummary(activities: ActivityFeed[]): string {
  if (activities.length === 0) return 'No activity yet';

  const latest = activities[activities.length - 1];
  const totalComments = activities.filter((a) => a.action === 'commented').length;

  return `${latest.actor.name} ${latest.description}. ${totalComments} comments total.`;
}

/**
 * Track typing indicators
 */
export class TypingIndicatorManager {
  private typingUsers: Map<string, TypingIndicator> = new Map();
  private readonly TIMEOUT_MS = 3000;

  /**
   * Mark user as typing
   */
  addTyping(userId: string, userName: string, ticketId: string): void {
    const key = `${ticketId}-${userId}`;
    this.typingUsers.set(key, {
      userId,
      userName,
      ticketId,
      timestamp: new Date(),
    });

    // Auto-remove after timeout
    setTimeout(() => {
      this.typingUsers.delete(key);
    }, this.TIMEOUT_MS);
  }

  /**
   * Remove user from typing
   */
  removeTyping(userId: string, ticketId: string): void {
    const key = `${ticketId}-${userId}`;
    this.typingUsers.delete(key);
  }

  /**
   * Get currently typing users for ticket
   */
  getTypingUsers(ticketId: string): TypingIndicator[] {
    return Array.from(this.typingUsers.values()).filter((t) => t.ticketId === ticketId);
  }

  /**
   * Format typing indicator text
   */
  getTypingText(ticketId: string): string {
    const typing = this.getTypingUsers(ticketId);
    if (typing.length === 0) return '';
    if (typing.length === 1) return `${typing[0].userName} is typing...`;
    if (typing.length === 2) return `${typing[0].userName} and ${typing[1].userName} are typing...`;
    return `${typing.length} people are typing...`;
  }
}

/**
 * Notification manager for mentions and assignments
 */
export class NotificationManager {
  private notifications: MentionNotification[] = [];

  /**
   * Add notification
   */
  addNotification(notification: MentionNotification): void {
    this.notifications.unshift(notification);
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): MentionNotification[] {
    return this.notifications.filter((n) => !n.read);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  /**
   * Get notifications for user
   */
  getUserNotifications(userId: string): MentionNotification[] {
    return this.notifications.filter((n) => n.userId === userId);
  }
}

export const typingIndicatorManager = new TypingIndicatorManager();
export const notificationManager = new NotificationManager();
