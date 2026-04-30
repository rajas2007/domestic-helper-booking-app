import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AppTheme } from '../constants/theme';

type BookingStatus = 'pending' | 'accepted' | 'rejected';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  pending: {
    label: 'PENDING',
    icon: '⏳',
    color: AppTheme.statusPending,
    bg: AppTheme.statusPendingBg,
    border: AppTheme.statusPendingBorder,
    glow: AppTheme.statusPendingGlow,
  },
  accepted: {
    label: 'ACCEPTED',
    icon: '✓',
    color: AppTheme.statusAccepted,
    bg: AppTheme.statusAcceptedBg,
    border: AppTheme.statusAcceptedBorder,
    glow: AppTheme.statusAcceptedGlow,
  },
  rejected: {
    label: 'REJECTED',
    icon: '✕',
    color: AppTheme.statusRejected,
    bg: AppTheme.statusRejectedBg,
    border: AppTheme.statusRejectedBorder,
    glow: AppTheme.statusRejectedGlow,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isSm = size === 'sm';

  useEffect(() => {
    // Entrance bounce
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Pulsing glow for pending status
    if (status === 'pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status, scaleAnim, glowAnim]);

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ scale: scaleAnim }],
          opacity: status === 'pending' ? glowAnim : 1,
        },
        isSm && styles.badgeSm,
      ]}
    >
      {/* Glow dot */}
      <View
        style={[
          styles.dot,
          { backgroundColor: config.color },
        ]}
      />

      {/* Icon */}
      <Text
        style={[
          styles.icon,
          { color: config.color },
          isSm && styles.iconSm,
        ]}
      >
        {config.icon}
      </Text>

      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: config.color },
          isSm && styles.labelSm,
        ]}
      >
        {config.label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginTop: 10,
  },
  badgeSm: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  icon: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconSm: {
    fontSize: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelSm: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
