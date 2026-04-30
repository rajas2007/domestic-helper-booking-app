import React, { useEffect } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";

export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  const duration = toast.duration || (toast.type === "error" ? 4000 : 3000);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Exit animation after duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onRemove(toast.id);
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, slideAnim, fadeAnim, scaleAnim, onRemove]);

  const getToastStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          backgroundColor: "rgba(34, 197, 94, 0.95)",
          borderLeftColor: "#22c55e",
          icon: "✓",
          iconColor: "#86efac",
        };
      case "error":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.95)",
          borderLeftColor: "#ef4444",
          icon: "✕",
          iconColor: "#fca5a5",
        };
      case "warning":
        return {
          backgroundColor: "rgba(251, 191, 36, 0.95)",
          borderLeftColor: "#fbbf24",
          icon: "!",
          iconColor: "#fef3c7",
        };
      default:
        return {
          backgroundColor: "rgba(51, 65, 85, 0.95)",
          borderLeftColor: "#64748b",
          icon: "ℹ",
          iconColor: "#cbd5f5",
        };
    }
  };

  const style = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: style.backgroundColor,
            borderLeftColor: style.borderLeftColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: style.iconColor }]}>
          {style.icon}
        </Text>
        <Text style={styles.message}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
