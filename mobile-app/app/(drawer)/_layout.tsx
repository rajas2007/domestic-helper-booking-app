import { Drawer } from "expo-router/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { NotificationStorage } from "../../utils/notificationStorage";
import { AppTheme } from "../../constants/theme";

function CustomDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadUnread = async () => {
      const unshown = await NotificationStorage.getUnshownNotifications();
      setUnreadCount(unshown.length);
    };
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await handleLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const isActive = (route: string) => pathname.includes(route);

  const MenuItem = ({ route, label, icon }: { route: string; label: string; icon: string }) => (
    <TouchableOpacity onPress={() => router.push(route as any)} style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={isActive(route.replace("/(drawer)/", "")) ? styles.activeItem : styles.item}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: AppTheme.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>H</Text>
            </View>
            <Text style={styles.appName}>Helperly</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role || "user"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menu}>
          <MenuItem route="/(drawer)/home" label="Explore" icon="🏠" />
          <MenuItem route="/(drawer)/bookings" label="My Bookings" icon="📅" />

          {/* NOTIFICATIONS WITH BADGE */}
          <TouchableOpacity onPress={() => router.push("/(drawer)/notifications" as any)} style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={isActive("notifications") ? styles.activeItem : styles.item}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <MenuItem route="/(drawer)/profile" label="Profile" icon="👤" />
          <MenuItem route="/(drawer)/settings" label="Settings" icon="⚙️" />
          <MenuItem route="/(drawer)/about" label="About App" icon="ℹ️" />

          {/* WORKER ONLY */}
          {user?.role === "worker" && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Worker</Text>
              <MenuItem route="/(drawer)/worker" label="Worker Panel" icon="👷" />
              <MenuItem route="/(drawer)/my-services" label="My Services" icon="🛠️" />
            </>
          )}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutBtn}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>

      </View>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        type="warning"
      />
    </SafeAreaView>
  );
}

export default function Layout() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={() => <CustomDrawerContent />}
    >
      <Drawer.Screen name="home" />
      <Drawer.Screen name="bookings" />
      <Drawer.Screen name="notifications" />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="worker" />
      <Drawer.Screen name="my-services" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="about" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },

  header: {
    marginTop: 10,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },

  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  appName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppTheme.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },

  userAvatarText: {
    color: AppTheme.primary,
    fontSize: 18,
    fontWeight: '700',
  },

  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  roleBadge: {
    backgroundColor: AppTheme.primaryGlow,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },

  roleText: {
    color: AppTheme.primary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  menu: {
    marginTop: 24,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },

  menuIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },

  item: {
    color: AppTheme.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  activeItem: {
    color: AppTheme.primary,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },

  notifBadge: {
    backgroundColor: AppTheme.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 12,
  },

  sectionLabel: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },

  logoutIcon: {
    fontSize: 18,
  },

  logout: {
    color: AppTheme.error,
    fontSize: 15,
    fontWeight: '600',
  },
});