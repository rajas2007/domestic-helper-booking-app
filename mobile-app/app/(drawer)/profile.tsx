import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const navigation: any = useNavigation();

  useEffect(() => {
    const getUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    getUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <LinearGradient
        colors={["#020617", "#020617", "#0f172a"]}
        style={{ flex: 1, padding: 20 }}
      >
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
          <View style={styles.avatar}>
            <Text style={{ color: "#fff", fontSize: 28 }}>👤</Text>
          </View>

          {/* INFO BLOCKS */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name || "User"}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || "---"}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role || "---"}</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  menu: {
    fontSize: 24,
    color: "#fff",
    marginRight: 10,
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  label: {
    color: "#94a3b8",
    fontSize: 12,
  },

  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 5,
  },

  statNumber: {
    color: "#3b82f6",
    fontSize: 24,
    fontWeight: "700",
  },

  statLabel: {
    color: "#94a3b8",
    marginTop: 5,
  },
});