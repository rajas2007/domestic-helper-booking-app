import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BookingDecisionModal, BookingDecisionType } from "./BookingDecisionModal";
import { NotificationStorage } from "../utils/notificationStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

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
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);

  const loadPersistentNotifications = useCallback(async () => {
    try {
      const unshownNotifications = await NotificationStorage.getUnshownNotifications();
      if (unshownNotifications.length === 0) return;

      const bookingNotifications: BookingNotification[] = unshownNotifications.map(n => ({
        id: n.id,
        type: n.type,
        serviceName: n.serviceName,
        userName: n.userName,
        workerName: n.workerName,
      }));

      setNotifications(bookingNotifications);
      if (bookingNotifications.length > 0) {
        setCurrentNotification(prev => prev ?? bookingNotifications[0]);
      }
    } catch (error) {
      console.error("Failed to load persistent notifications:", error);
    }
  }, []);

  useEffect(() => {
    loadPersistentNotifications();
  }, [loadPersistentNotifications]);

  const showBookingDecision = useCallback(
    (type: BookingDecisionType, serviceName: string, userName: string, workerName?: string) => {
      const notification: BookingNotification = {
        id: `booking-${Date.now()}-${Math.random()}`,
        type,
        serviceName,
        userName,
        workerName,
      };

      if (isModalAnimating || currentNotification) {
        setNotifications(prev => [...prev, notification]);
        return;
      }

      setCurrentNotification(notification);
    },
    [currentNotification, isModalAnimating]
  );

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const checkMissedNotifications = useCallback(async () => {
    if (isCheckingNotifications) return;
    setIsCheckingNotifications(true);

    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const lastCheck = await AsyncStorage.getItem("@last_notification_check");
      const since = lastCheck ? parseInt(lastCheck, 10) : Date.now() - 24 * 60 * 60 * 1000;

      const response = await api.get(`/api/bookings/status-changes/${user.id}?since=${since}`);
      const statusChanges = response.data;

      for (const change of statusChanges) {
        const notificationType = change.status === "accepted" ? "accepted" : "rejected";
        const userName = change.user_id === user.id ? change.user_name || "User" : "You";
        const workerName = change.worker_name || "Worker";

        await NotificationStorage.saveNotification({
          id: `status-change-${change.id}-${notificationType}`,
          type: notificationType,
          serviceName: change.service_title || "Service",
          userName,
          workerName,
          timestamp: change.updated_at ? new Date(change.updated_at).getTime() : Date.now(),
        });
      }

      await AsyncStorage.setItem("@last_notification_check", Date.now().toString());
      await loadPersistentNotifications();
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error("Failed to check missed notifications:", error);
      }
    } finally {
      setIsCheckingNotifications(false);
    }
  }, [isCheckingNotifications, loadPersistentNotifications]);

  useEffect(() => {
    checkMissedNotifications();

    const interval = setInterval(() => {
      if (!currentNotification) {
        checkMissedNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [checkMissedNotifications, currentNotification]);

  const handleModalClose = useCallback(async () => {
    if (isModalAnimating) return;
    setIsModalAnimating(true);

    if (currentNotification) {
      try {
        await NotificationStorage.markAsShown(currentNotification.id);
      } catch (error) {
        console.error("Failed to mark notification as shown:", error);
      }
    }

    setCurrentNotification(null);

    setTimeout(() => {
      setNotifications(prev => {
        if (prev.length > 0) {
          const [nextNotification, ...rest] = prev;
          setCurrentNotification(nextNotification);
          return rest;
        }
        return prev;
      });
      setIsModalAnimating(false);
    }, 300);
  }, [currentNotification, isModalAnimating]);

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
      {currentNotification && !isModalAnimating ? (
        <BookingDecisionModal
          key={`modal-${currentNotification.id}-${Date.now()}`}
          visible={!!currentNotification && !isModalAnimating}
          type={currentNotification.type}
          serviceName={currentNotification.serviceName}
          userName={currentNotification.userName}
          workerName={currentNotification.workerName}
          onClose={handleModalClose}
        />
      ) : null}
    </BookingNotificationContext.Provider>
  );
};
