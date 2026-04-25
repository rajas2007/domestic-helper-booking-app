import { Drawer } from "expo-router/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function CustomDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<any>(null);

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

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  const isActive = (route: string) => pathname.includes(route);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#020617",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appName}>Helperly</Text>
          <Text style={styles.role}>
            {user?.name || "User"} ({user?.role || "user"})
          </Text>
        </View>

        {/* MENU */}
        <View style={styles.menu}>
          
          <TouchableOpacity onPress={() => router.push("/(drawer)/profile")}>
            <Text style={isActive("profile") ? styles.activeItem : styles.item}>
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/home")}>
            <Text style={isActive("home") ? styles.activeItem : styles.item}>
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/bookings")}>
            <Text style={isActive("bookings") ? styles.activeItem : styles.item}>
              My Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/settings")}>
            <Text style={isActive("settings") ? styles.activeItem : styles.item}>
              Settings
            </Text>
          </TouchableOpacity>

          {/* WORKER ONLY */}
          {user?.role === "worker" && (
            <>
              <TouchableOpacity onPress={() => router.push("/(drawer)/worker")}>
                <Text style={isActive("worker") ? styles.activeItem : styles.item}>
                  Worker Panel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/(drawer)/my-services")}>
                <Text style={isActive("my-services") ? styles.activeItem : styles.item}>
                  My Services
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>

      </View>
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
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="worker" />
      <Drawer.Screen name="my-services" />
      <Drawer.Screen name="settings" />
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
    marginTop: 20,
  },

  appName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  role: {
    color: "#94a3b8",
    marginTop: 5,
  },

  menu: {
    marginTop: 30,
  },

  item: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 20,
  },

  activeItem: {
    color: "#3b82f6",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "600",
  },

  logout: {
    color: "#ef4444",
    fontSize: 16,
  },
});