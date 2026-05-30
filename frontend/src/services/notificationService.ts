type NotificationListener = (title: string, message: string) => void;

let notificationsSilenced = false;
const listeners: Set<NotificationListener> = new Set();

export const notificationService = {
  setNotificationsSilenced(silenced: boolean) {
    notificationsSilenced = silenced;
    console.log(`[NotificationService] Notifications are now ${silenced ? 'SILENCED' : 'ACTIVE'}`);
  },

  isNotificationsSilenced() {
    return notificationsSilenced;
  },

  addListener(listener: NotificationListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Simulates receiving a notification.
   * If notifications are silenced, it will block it.
   */
  receiveNotification(title: string, message: string): boolean {
    if (notificationsSilenced) {
      console.log(`[NotificationService] Blocked notification (silenced): "${title}" - "${message}"`);
      return false; // Blocked
    }
    
    console.log(`[NotificationService] Dispatched notification: "${title}" - "${message}"`);
    listeners.forEach((listener) => {
      try {
        listener(title, message);
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });
    return true; // Delivered
  }
};
