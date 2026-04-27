import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { AppTheme } from "../../constants/theme";
import { getErrorMessage } from "../../utils/errorHandler";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const navigation: any = useNavigation();
  const router = useRouter();

  const loadData = useCallback(async () => {
    const stored = await AsyncStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    setUser(u);

    try {
      const bookRes = await axios.get(
        `https://domestic-helper-booking-app.onrender.com/api/bookings/user/${u.id}`
      );
      setBookingCount(bookRes.data.length);
    } catch {}

    if (u.role === "worker") {
      try {
        const svcRes = await axios.get(
          `https://domestic-helper-booking-app.onrender.com/api/services/worker/${u.id}`
        );
        setServiceCount(svcRes.data.length);
      } catch {}
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadData);
    return unsub;
  }, [navigation, loadData]);

  const getInitial = () => user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.background }}>
      <LinearGradient colors={AppTheme.gradientBackground} style={{ flex: 1, padding: 20 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.card}>
          {/* AVATAR */}
          <LinearGradient colors={AppTheme.gradientAccent} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </LinearGradient>

          {/* NAME */}
          <Text style={styles.name}>{user?.name || "User"}</Text>

          {/* ROLE BADGE */}
          <View style={[styles.roleBadge, user?.role === 'worker' ? styles.workerBadge : styles.userBadge]}>
            <Text style={styles.roleText}>
              {user?.role === 'worker' ? '👷 Worker' : '👤 User'}
            </Text>
          </View>

          {/* INFO BLOCKS */}
          <View style={styles.infoSection}>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>✉️</Text>
              <View>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email || "---"}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🆔</Text>
              <View>
                <Text style={styles.label}>User ID</Text>
                <Text style={styles.value}>#{user?.id || "---"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bookingCount}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>

          {user?.role === 'worker' && (
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: AppTheme.statusAccepted }]}>{serviceCount}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
          )}

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: AppTheme.statusPending }]}>
              {user?.role === 'worker' ? '👷' : '👤'}
            </Text>
            <Text style={styles.statLabel}>{user?.role || 'user'}</Text>
          </View>
        </View>

        {/* EDIT BUTTON */}
        <TouchableOpacity onPress={() => router.push("/(drawer)/settings" as any)} style={styles.editWrapper}>
          <LinearGradient colors={AppTheme.gradientPrimary} style={styles.editButton}>
            <Text style={styles.editText}>✏️ Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  menu: { fontSize: 24, color: "#fff", marginRight: 10 },
  title: { fontSize: 26, color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: AppTheme.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },

  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },

  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  workerBadge: {
    backgroundColor: AppTheme.statusPendingBg,
  },

  userBadge: {
    backgroundColor: AppTheme.primaryGlow,
  },

  roleText: {
    color: AppTheme.textHighlight,
    fontSize: 13,
    fontWeight: '600',
  },

  infoSection: {
    width: '100%',
    gap: 10,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoIcon: {
    fontSize: 20,
  },

  label: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },

  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 1,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: AppTheme.card,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
  },

  statNumber: {
    color: AppTheme.primary,
    fontSize: 24,
    fontWeight: "700",
  },

  statLabel: {
    color: AppTheme.textSecondary,
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  editWrapper: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },

  editButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  editText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});