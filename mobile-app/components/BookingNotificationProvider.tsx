import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { BookingDecisionModal, BookingDecisionType } from "./BookingDecisionModal";
import { NotificationStorage } from "../utils/notificationStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface BookingNotification {
  id: string;
  type: BookingDecisionType;
  serviceName: string;
  userName: string;
  workerName?: string;
}

interface BookingNotificationContextType {
  showBookingDecision: (
    type: BookingDecisionType,
    serviceName: string,
    userName: string,
    workerName?: string
  ) => void;
  checkMissedNotifications: () => Promise<void>;
  notifications: BookingNotification[];
  clearNotification: (id: string) => void;
}

const BookingNotificationContext = createContext<BookingNotificationContextType | undefined>(
  undefined
);

export const useBookingNotification = () => {
  const context = useContext(BookingNotificationContext);
  if (!context) {
    throw new Error("useBookingNotification must be used within BookingNotificationProvider");
  }
  return context;
};

export const BookingNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<BookingNotification | null>(null);

  // Load persistent notifications on mount
  useEffect(() => {
    const loadPersistentNotifications = async () => {
      try {
        const unshownNotifications = await NotificationStorage.getUnshownNotifications();

        if (unshownNotifications.length > 0) {
          // Convert persistent notifications to current format
          const bookingNotifications: BookingNotification[] = unshownNotifications.map(n => ({
            id: n.id,
            type: n.type,
            serviceName: n.serviceName,
            userName: n.userName,
            workerName: n.workerName,
          }));

          setNotifications(bookingNotifications);

          // Show first notification
          if (bookingNotifications.length > 0) {
            setCurrentNotification(bookingNotifications[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load persistent notifications:", error);
      }
    };

    loadPersistentNotifications();
  }, []);

  const showBookingDecision = useCallback(
    (type: BookingDecisionType, serviceName: string, userName: string, workerName?: string) => {
      const notification: BookingNotification = {
        id: `booking-${Date.now()}-${Math.random()}`,
        type,
        serviceName,
        userName,
        workerName,
      };

      // If no modal is currently showing, show it immediately
      if (!currentNotification) {
        setCurrentNotification(notification);
      } else {
        // Otherwise, queue it
        setNotifications(prev => [...prev, notification]);
      }
    },
    [currentNotification]
  );

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const checkMissedNotifications = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const lastCheck = await AsyncStorage.getItem("@last_notification_check");
      const since = lastCheck ? parseInt(lastCheck) : Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours

      const response = await axios.get(
        `https://domestic-helper-booking-app.onrender.com/api/bookings/status-changes/${user.id}?since=${since}`
      );

      const statusChanges = response.data;

      // Create notifications for status changes
      for (const change of statusChanges) {
        const notificationType = change.status === "accepted" ? "accepted" : "rejected";
        const userName = change.user_id === user.id ? (change.user_name || "User") : "You";
        const workerName = change.worker_name || "Worker";

        // Store as persistent notification
        await NotificationStorage.saveNotification({
          id: `status-change-${change.id}-${notificationType}`,
          type: notificationType,
          serviceName: change.service_title || "Service",
          userName,
          workerName,
          timestamp: change.updated_at ? new Date(change.updated_at).getTime() : Date.now(),
        });
      }

      // Update last check time
      await AsyncStorage.setItem("@last_notification_check", Date.now().toString());

      // Load and show any unshown notifications
      const unshownNotifications = await NotificationStorage.getUnshownNotifications();
      if (unshownNotifications.length > 0) {
        const bookingNotifications: BookingNotification[] = unshownNotifications.map(n => ({
          id: n.id,
          type: n.type,
          serviceName: n.serviceName,
          userName: n.userName,
          workerName: n.workerName,
        }));

        setNotifications(prev => [...prev, ...bookingNotifications]);

        // Show first notification if none is currently showing
        if (!currentNotification && bookingNotifications.length > 0) {
          setCurrentNotification(bookingNotifications[0]);
        }
      }
    } catch (error: any) {
      // Handle 404 gracefully - endpoint might not be deployed yet
      if (error?.response?.status === 404) {
        // Silent handling - endpoint not available yet
        return;
      } else {
        console.error("Failed to check missed notifications:", error);
      }
    }
  }, [currentNotification]);

  // Global polling for new notifications
  useEffect(() => {
    checkMissedNotifications(); // Check immediately on mount
    
    const interval = setInterval(() => {
      checkMissedNotifications();
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [checkMissedNotifications]);

  const handleModalClose = useCallback(async () => {
    if (currentNotification) {
      // Mark as shown in persistent storage
      try {
        await NotificationStorage.markAsShown(currentNotification.id);
      } catch (error) {
        console.error("Failed to mark notification as shown:", error);
      }
    }

    setCurrentNotification(null);

    // Show next notification in queue if any
    setNotifications(prev => {
      if (prev.length > 0) {
        const nextNotification = prev[0];
        setCurrentNotification(nextNotification);
        return prev.slice(1);
      }
      return prev;
    });
  }, [currentNotification]);

  return (
    <BookingNotificationContext.Provider
      value={{
        showBookingDecision,
        checkMissedNotifications,
        notifications,
        clearNotification,
      }}
    >
      {children}
      {currentNotification && (
        <BookingDecisionModal
          visible={true}
          type={currentNotification.type}
          serviceName={currentNotification.serviceName}
          userName={currentNotification.userName}
          workerName={currentNotification.workerName}
          onClose={handleModalClose}
        />
      )}
    </BookingNotificationContext.Provider>
  );
};