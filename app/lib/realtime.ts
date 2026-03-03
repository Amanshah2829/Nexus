import { EventEmitter } from 'events';

/**
 * Simple in-memory real-time event system
 * In production, use Redis or a dedicated solution like Pusher
 */

export interface RealtimeEvent {
  type: string;
  userId: string;
  data: any;
  timestamp: Date;
  id: string;
}

export interface RealtimeListener {
  userId: string;
  callback: (event: RealtimeEvent) => void;
  types?: string[]; // Filter by event type
}

class RealtimeSystem extends EventEmitter {
  private listeners: Map<string, RealtimeListener[]> = new Map();
  private eventHistory: RealtimeEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to real-time events
   */
  subscribe(userId: string, callback: (event: RealtimeEvent) => void, types?: string[]): () => void {
    const listener: RealtimeListener = { userId, callback, types };
    
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    
    this.listeners.get(userId)!.push(listener);

    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        const index = userListeners.indexOf(listener);
        if (index > -1) {
          userListeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Broadcast event to specific user
   */
  emit(userId: string, eventType: string, data: any): void {
    const event: RealtimeEvent = {
      type: eventType,
      userId,
      data,
      timestamp: new Date(),
      id: `${userId}:${Date.now()}:${Math.random()}`,
    };

    // Store in history
    this.addToHistory(event);

    // Emit to all listeners for this user
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(listener => {
        // Filter by type if specified
        if (!listener.types || listener.types.includes(eventType)) {
          try {
            listener.callback(event);
          } catch (error) {
            console.error('[Realtime Error]', error);
          }
        }
      });
    }

    // Emit to parent EventEmitter for logging
    this.emit(`realtime:${eventType}`, event);
  }

  /**
   * Broadcast to multiple users
   */
  broadcastToUsers(userIds: string[], eventType: string, data: any): void {
    userIds.forEach(userId => {
      this.emit(userId, eventType, data);
    });
  }

  /**
   * Broadcast to all users (system-wide)
   */
  broadcastAll(eventType: string, data: any): void {
    const allUserIds = Array.from(this.listeners.keys());
    this.broadcastToUsers(allUserIds, eventType, data);
  }

  /**
   * Add event to history
   */
  private addToHistory(event: RealtimeEvent): void {
    this.eventHistory.push(event);
    
    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get recent events for a user
   */
  getRecentEvents(userId: string, limit: number = 50): RealtimeEvent[] {
    return this.eventHistory
      .filter(e => e.userId === userId)
      .slice(-limit);
  }

  /**
   * Clear history for a user
   */
  clearHistory(userId: string): void {
    this.eventHistory = this.eventHistory.filter(e => e.userId !== userId);
  }

  /**
   * Get number of active subscribers
   */
  getSubscriberCount(userId: string): number {
    return this.listeners.get(userId)?.length || 0;
  }

  /**
   * Get all active users
   */
  getActiveUsers(): string[] {
    return Array.from(this.listeners.keys()).filter(userId => {
      return (this.listeners.get(userId)?.length || 0) > 0;
    });
  }
}

// Singleton instance
export const realtimeSystem = new RealtimeSystem();

/**
 * Event types for real-time system
 */
export const RealtimeEventTypes = {
  // Complaint events
  COMPLAINT_CREATED: 'complaint:created',
  COMPLAINT_UPDATED: 'complaint:updated',
  COMPLAINT_CLOSED: 'complaint:closed',
  COMPLAINT_ASSIGNED: 'complaint:assigned',
  COMPLAINT_STATUS_CHANGED: 'complaint:status_changed',
  
  // Comment events
  COMMENT_ADDED: 'comment:added',
  COMMENT_DELETED: 'comment:deleted',
  
  // Remote session events
  REMOTE_SESSION_REQUESTED: 'remote_session:requested',
  REMOTE_SESSION_APPROVED: 'remote_session:approved',
  REMOTE_SESSION_DENIED: 'remote_session:denied',
  REMOTE_SESSION_STARTED: 'remote_session:started',
  REMOTE_SESSION_ENDED: 'remote_session:ended',
  REMOTE_SESSION_MESSAGE: 'remote_session:message',
  
  // Notification events
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_READ: 'notification:read',
  
  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  
  // System events
  SYSTEM_ALERT: 'system:alert',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_UPDATE: 'system:update',
};

/**
 * Subscribe to real-time events
 */
export function subscribeToEvents(
  userId: string,
  callback: (event: RealtimeEvent) => void,
  eventTypes?: string[]
): () => void {
  return realtimeSystem.subscribe(userId, callback, eventTypes);
}

/**
 * Emit real-time event to user
 */
export function emitEvent(userId: string, eventType: string, data: any): void {
  realtimeSystem.emit(userId, eventType, data);
}

/**
 * Emit event to multiple users
 */
export function emitToUsers(userIds: string[], eventType: string, data: any): void {
  realtimeSystem.broadcastToUsers(userIds, eventType, data);
}

/**
 * System-wide broadcast
 */
export function broadcastEvent(eventType: string, data: any): void {
  realtimeSystem.broadcastAll(eventType, data);
}
