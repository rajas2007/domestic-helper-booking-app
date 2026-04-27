import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { NotificationStorage, PersistentNotification } from "../../utils/notificationStorage";
import { EmptyState } from "../../components/EmptyState";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { AppTheme } from "../../constants/theme";

export default function Notifications() {
  const navigation: any = useNavigation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<PersistentNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const loadNotifications = useCallback(async () => {
    const all = await NotificationStorage.getNotifications();
    setNotifications(all.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadNotifications);
    return unsub;
  }, [navigation, loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleClearAll = async () => {
    await NotificationStorage.clearAllNotifications();
    setNotifications([]);
    setShowClearModal(false);
  };

  const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.background }}>
      <LinearGradient colors={AppTheme.gradientBackground} style={{ flex: 1, padding: 20 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={styles.menu}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Notifications</Text>
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={() => setShowClearModal(true)} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppTheme.primary]} tintColor={AppTheme.primary} />}
          ListEmptyComponent={<EmptyState icon="🔔" title="No notifications" subtitle="You'll see booking updates here" />}
          renderItem={({ item }) => (
            <AnimatedPressable style={styles.card} onPress={() => router.push("/(drawer)/bookings")}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: item.type === 'accepted' ? AppTheme.statusAcceptedBg : AppTheme.statusRejectedBg }]}>
                  <Text style={styles.iconText}>{item.type === 'accepted' ? '✓' : '✕'}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.notifTitle}>
                    Booking {item.type === 'accepted' ? 'Accepted' : 'Rejected'}
                  </Text>
                  <Text style={styles.notifMessage}>
                    {item.type === 'accepted'
                      ? `Your booking for "${item.serviceName}" was accepted${item.workerName ? ` by ${item.workerName}` : ''}`
                      : `Your booking for "${item.serviceName}" was rejected`}
                  </Text>
                  <Text style={styles.timeAgo}>{getTimeAgo(item.timestamp)}</Text>
                </View>
              </View>
              <StatusBadge status={item.type} size="sm" />
            </AnimatedPressable>
          )}
        />
      </LinearGradient>

      <ConfirmationModal
        visible={showClearModal}
        title="Clear Notifications"
        message="Are you sure you want to clear all notifications?"
        confirmText="Clear All"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
        type="warning"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  menu: { fontSize: 26, color: "#fff", marginRight: 10 },
  title: { fontSize: 28, color: "#fff", fontWeight: "700" },
  clearBtn: { backgroundColor: AppTheme.statusRejectedBg, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: AppTheme.statusRejectedBorder },
  clearText: { color: AppTheme.statusRejected, fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: AppTheme.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: AppTheme.cardBorder },
  cardHeader: { flexDirection: 'row', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  cardContent: { flex: 1 },
  notifTitle: { color: AppTheme.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  notifMessage: { color: AppTheme.textSecondary, fontSize: 13, lineHeight: 18 },
  timeAgo: { color: AppTheme.textMuted, fontSize: 11, marginTop: 4 },
});
