import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BookingDecisionModal,
  BookingDecisionType,
} from "./BookingDecisionModal";

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
}

const BookingNotificationContext =
  createContext<
    BookingNotificationContextType | undefined
  >(undefined);

export const useBookingNotification = () => {
  const context = useContext(
    BookingNotificationContext
  );

  if (!context) {
    throw new Error(
      "useBookingNotification must be used within BookingNotificationProvider"
    );
  }

  return context;
};

export const BookingNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [currentNotification, setCurrentNotification] =
    useState<BookingNotification | null>(null);

  const [isModalVisible, setIsModalVisible] =
    useState(false);

  const shownNotificationsRef =
    useRef<Set<string>>(new Set());

  const pollingRef = useRef<any>(null);

  const showBookingDecision = useCallback(
    (
      type: BookingDecisionType,
      serviceName: string,
      userName: string,
      workerName?: string
    ) => {

      const id =
        `${type}-${serviceName}-${Date.now()}`;

      // Prevent duplicate popup spam
      if (
        shownNotificationsRef.current.has(id)
      ) {
        return;
      }

      shownNotificationsRef.current.add(id);

      if (!isModalVisible && !currentNotification) {

        setCurrentNotification({
          id,
          type,
          serviceName,
          userName,
          workerName,
        });

        setTimeout(() => {
          setIsModalVisible(true);
        }, 100);
      }

    },
    [isModalVisible, currentNotification]
  );

  const checkMissedNotifications =
    useCallback(async () => {

      try {

        const userData =
          await AsyncStorage.getItem("user");

        // Stop completely if logged out
        if (!userData) {
          return;
        }

        const user = JSON.parse(userData);

        const lastCheck =
          await AsyncStorage.getItem(
            "@last_notification_check"
          );

        const since = lastCheck
          ? parseInt(lastCheck, 10)
          : Date.now() -
            24 * 60 * 60 * 1000;

        const response = await api.get(
          `/api/bookings/status-changes/${user.id}?since=${since}`
        );

        const changes = response.data || [];

        for (const change of changes) {

          const notificationType =
            change.status === "accepted"
              ? "accepted"
              : "rejected";

          const uniqueId =
            `${change.id}-${notificationType}`;

          // Prevent duplicates forever
          if (
            shownNotificationsRef.current.has(
              uniqueId
            )
          ) {
            continue;
          }

          shownNotificationsRef.current.add(
            uniqueId
          );

          // Prevent double modal opening
          if (
            !isModalVisible &&
            !currentNotification
          ) {

            setCurrentNotification({
              id: uniqueId,
              type: notificationType,
              serviceName:
                change.service_title ||
                "Service",
              userName:
                change.user_name || "User",
              workerName:
                change.worker_name ||
                "Worker",
            });

            setTimeout(() => {
              setIsModalVisible(true);
            }, 100);

          }

          break;
        }

        await AsyncStorage.setItem(
          "@last_notification_check",
          Date.now().toString()
        );

      } catch (error: any) {

        if (
          error?.response?.status !== 404
        ) {
          console.error(
            "Notification check failed:",
            error
          );
        }
      }

    }, [
      isModalVisible,
      currentNotification,
    ]);

  useEffect(() => {

    const initialize = async () => {

      const userData =
        await AsyncStorage.getItem("user");

      // Never start polling while logged out
      if (!userData) {
        return;
      }

      await checkMissedNotifications();

      pollingRef.current = setInterval(
        () => {

          if (
            !isModalVisible &&
            !currentNotification
          ) {
            checkMissedNotifications();
          }

        },
        30000
      );
    };

    initialize();

    return () => {

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };

  }, [checkMissedNotifications]);

  const handleModalClose = useCallback(() => {

    setIsModalVisible(false);

    setTimeout(() => {
      setCurrentNotification(null);
    }, 200);

  }, []);

  return (
    <BookingNotificationContext.Provider
      value={{
        showBookingDecision,
        checkMissedNotifications,
      }}
    >
      {children}

      {currentNotification && (
        <BookingDecisionModal
          key={currentNotification.id}
          visible={isModalVisible}
          type={currentNotification.type}
          serviceName={
            currentNotification.serviceName
          }
          userName={
            currentNotification.userName
          }
          workerName={
            currentNotification.workerName
          }
          onClose={handleModalClose}
        />
      )}

    </BookingNotificationContext.Provider>
  );
};