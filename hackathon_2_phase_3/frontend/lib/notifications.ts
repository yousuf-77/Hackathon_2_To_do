/**
 * Browser notification utilities for task due date reminders
 * Phase 3: AI-Powered Todo Chatbot Enhancements
 */

import type { Task } from "@/types/task";

/**
 * Permission status for notifications
 */
export type NotificationPermission = "default" | "granted" | "denied";

/**
 * Notification request result
 */
interface NotificationRequestResult {
  /**
   * Whether permission was granted
   */
  granted: boolean;
  /**
   * Permission status
   */
  permission: NotificationPermission;
}

/**
 * Request notification permission from browser
 *
 * @example
 * ```tsx
 * function App() {
 *   useEffect(() => {
 *     requestNotificationPermission().then(result => {
 *       if (!result.granted) {
 *         console.log('Notifications denied');
 *       }
 *     });
 *   }, []);
 * }
 * ```
 */
export async function requestNotificationPermission(): Promise<NotificationRequestResult> {
  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.warn("Browser doesn't support notifications");
    return { granted: false, permission: "denied" };
  }

  // If already granted, return early
  if (Notification.permission === "granted") {
    return { granted: true, permission: "granted" };
  }

  // If already denied, return early
  if (Notification.permission === "denied") {
    return { granted: false, permission: "denied" };
  }

  // Request permission
  const permission = await Notification.requestPermission();

  return {
    granted: permission === "granted",
    permission,
  };
}

/**
 * Check if notification permission is granted
 */
export function hasNotificationPermission(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Show a notification immediately
 *
 * @param title - Notification title
 * @param options - Notification options
 *
 * @example
 * ```tsx
 * showNotification('Task Due Soon!', {
 *   body: 'Buy groceries is due in 15 minutes',
 *   icon: '/icon.png',
 *   tag: 'task-123',
 * });
 * ```
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  // Check if notifications are supported and permission granted
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted");
    return null;
  }

  // Create and show notification
  try {
    const notification = new Notification(title, {
      icon: "/icon.png",
      badge: "/badge.png",
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return null;
  }
}

/**
 * Schedule a notification for a task due date
 *
 * @param task - Task to schedule notification for
 * @param minutesBefore - Minutes before due date to notify (default: 15)
 *
 * @example
 * ```tsx
 * scheduleNotificationForTask(
 *   { id: '123', title: 'Buy groceries', due_date: '2025-02-12T14:00:00Z' },
 *   15 // 15 minutes before
 * );
 * ```
 */
export function scheduleNotificationForTask(
  task: Task,
  minutesBefore: number = 15
): () => void {
  // @ts-ignore - due_date not currently in Task type
  // Check if task has due date
  if (!(task as any).due_date) {
    return () => {};
  }

  // Calculate notification time
  const dueDate = new Date((task as any).due_date);
  const notificationTime = new Date(dueDate);
  notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

  const now = new Date();

  // If notification time is in the past, don't schedule
  if (notificationTime <= now) {
    console.warn("Notification time is in the past, not scheduling");
    return () => {};
  }

  // Calculate timeout duration
  const timeoutDuration = notificationTime.getTime() - now.getTime();

  // Schedule notification
  const timeoutId = setTimeout(() => {
    const priorityEmoji = getPriorityEmoji(task.priority);
    showNotification(
      `Task Due Soon! ⏰`,
      {
        body: `${priorityEmoji} ${task.title} is due in ${minutesBefore} minutes`,
        icon: "/icon.png",
        tag: `task-${task.id}`,
        requireInteraction: false,
        silent: false,
      }
    );
  }, timeoutDuration);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
}

/**
 * Schedule multiple notifications for a task
 * (e.g., 1 day before, 1 hour before, 15 minutes before)
 *
 * @param task - Task to schedule notifications for
 *
 * @example
 * ```tsx
 * const cleanup = scheduleMultipleNotifications(task);
 * // Later...
 * cleanup(); // Cancel all notifications
 * ```
 */
export function scheduleMultipleNotifications(
  task: Task
): () => void {
  const cleanupFunctions: (() => void)[] = [];

  // @ts-ignore - due_date not currently in Task type
  // Only schedule if task has due date
  if ((task as any).due_date) {
    const now = new Date();
    const dueDate = new Date((task as any).due_date);

    // Calculate time differences in milliseconds
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const fifteenMinutes = 15 * 60 * 1000;

    // Schedule 1 day before
    const oneDayBefore = new Date(dueDate);
    oneDayBefore.setTime(oneDayBefore.getTime() - oneDay);

    if (oneDayBefore > now) {
      cleanupFunctions.push(scheduleNotificationForTask(task, 24 * 60));
    }

    // Schedule 1 hour before
    const oneHourBefore = new Date(dueDate);
    oneHourBefore.setTime(oneHourBefore.getTime() - oneHour);

    if (oneHourBefore > now) {
      cleanupFunctions.push(scheduleNotificationForTask(task, 60));
    }

    // Schedule 15 minutes before
    const fifteenMinutesBefore = new Date(dueDate);
    fifteenMinutesBefore.setTime(fifteenMinutesBefore.getTime() - fifteenMinutes);

    if (fifteenMinutesBefore > now) {
      cleanupFunctions.push(scheduleNotificationForTask(task, 15));
    }
  }

  // Return cleanup function that cancels all scheduled notifications
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Get priority emoji for display
 */
function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case "high":
      return "🔴";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    default:
      return "⚪";
  }
}

/**
 * Notification manager class for managing multiple task notifications
 */
export class NotificationManager {
  private scheduledNotifications: Map<string, () => void> = new Map();

  /**
   * Schedule notifications for a task
   */
  scheduleTaskNotifications(task: Task): void {
    // Clear existing notifications for this task
    this.clearTaskNotifications(task.id);

    // Schedule new notifications
    const cleanup = scheduleMultipleNotifications(task);

    // Store cleanup function
    this.scheduledNotifications.set(task.id, cleanup);
  }

  /**
   * Clear notifications for a specific task
   */
  clearTaskNotifications(taskId: string): void {
    const cleanup = this.scheduledNotifications.get(taskId);
    if (cleanup) {
      cleanup();
      this.scheduledNotifications.delete(taskId);
    }
  }

  /**
   * Clear all scheduled notifications
   */
  clearAllNotifications(): void {
    this.scheduledNotifications.forEach((cleanup) => cleanup());
    this.scheduledNotifications.clear();
  }

  /**
   * Get count of scheduled notifications
   */
  getScheduledCount(): number {
    return this.scheduledNotifications.size;
  }
}

/**
 * Global notification manager instance
 */
export const notificationManager = new NotificationManager();

/**
 * Hook to manage notifications for tasks
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const { scheduleTask, clearTask } = useTaskNotifications();
 *
 *   useEffect(() => {
 *     tasks.forEach(task => scheduleTask(task));
 *   }, [tasks]);
 *
 *   return (
 *     <div>
 *       {tasks.map(task => (
 *         <TaskCard
 *           key={task.id}
 *           task={task}
 *           onComplete={() => {
 *             completeTask(task.id);
 *             clearTask(task.id); // Clear notifications for completed task
 *           }}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTaskNotifications() {
  const scheduleTask = (task: Task) => {
    notificationManager.scheduleTaskNotifications(task);
  };

  const clearTask = (taskId: string) => {
    notificationManager.clearTaskNotifications(taskId);
  };

  const clearAll = () => {
    notificationManager.clearAllNotifications();
  };

  return {
    scheduleTask,
    clearTask,
    clearAll,
    scheduledCount: notificationManager.getScheduledCount(),
  };
}

export default {
  requestNotificationPermission,
  hasNotificationPermission,
  showNotification,
  scheduleNotificationForTask,
  scheduleMultipleNotifications,
  notificationManager,
  useTaskNotifications,
};
