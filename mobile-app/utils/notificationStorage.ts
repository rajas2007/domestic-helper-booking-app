import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PersistentNotification {
  id: string;
  type: "accepted" | "rejected";
  serviceName: string;
  userName: string;
  workerName?: string;
  timestamp: number;
  shown: boolean;
}

const NOTIFICATIONS_KEY = "@booking_notifications";

export class NotificationStorage {
  static async saveNotification(notification: Omit<PersistentNotification, "shown">): Promise<void> {
    try {
      const existing = await this.getNotifications();

      // Prevent duplicates by checking if ID already exists
      if (existing.some(n => n.id === notification.id)) {
        return;
      }

      const newNotification: PersistentNotification = {
        ...notification,
        shown: false,
      };

      existing.push(newNotification);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error("Failed to save notification:", error);
    }
  }

  static async getNotifications(): Promise<PersistentNotification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return [];
    }
  }

  static async markAsShown(id: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map(n =>
        n.id === id ? { ...n, shown: true } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to mark notification as shown:", error);
    }
  }

  static async getUnshownNotifications(): Promise<PersistentNotification[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.shown);
  }

  static async clearOldNotifications(daysOld: number = 7): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

      const recent = notifications.filter(n => n.timestamp > cutoffTime);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error("Failed to clear old notifications:", error);
    }
  }

  static async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }
}