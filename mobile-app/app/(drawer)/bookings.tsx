import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyBookings() {
  const navigation: any = useNavigation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await axios.get(
        `https://semester-flight-those.ngrok-free.dev/api/bookings/user/${user.id}`
      );

      setBookings(res.data);
    } catch (err) {
      console.log("USER BOOKINGS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const toggleDropdown = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusStyle = (status: string) => {
    if (status === "accepted") return styles.accepted;
    if (status === "rejected") return styles.rejected;
    return styles.pending;
  };

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

          <Text style={styles.title}>My Bookings</Text>
        </View>

        {/* LIST */}
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No bookings found</Text>
          }
          renderItem={({ item }: any) => {
            const isExpanded = expandedId === item.id;

            return (
              <View style={styles.card}>

                {/* TITLE */}
                <Text style={styles.service}>{item.title}</Text>

                {/* DESCRIPTION */}
                <Text style={styles.description}>{item.description}</Text>

                {/* PRICE */}
                <Text style={styles.price}>₹ {item.price}</Text>

                {/* STATUS */}
                <View style={[styles.badge, getStatusStyle(item.status)]}>
                  <Text style={styles.badgeText}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>

                {/* DROPDOWN (ONLY WHEN ACCEPTED) */}
                {item.status === "accepted" && (
                  <>
                    <TouchableOpacity onPress={() => toggleDropdown(item.id)}>
                      <Text style={{ color: "#3b82f6", marginTop: 10 }}>
                        {isExpanded ? "Hide Details ▲" : "View Details ▼"}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ color: "#94a3b8" }}>
                          Worker: {item.worker_name}
                        </Text>
                        <Text style={{ color: "#94a3b8" }}>
                          Email: {item.worker_email}
                        </Text>
                      </View>
                    )}
                  </>
                )}

              </View>
            );
          }}
        />
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
    fontSize: 26,
    color: "#fff",
    marginRight: 10,
  },

  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  service: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  description: {
    color: "#94a3b8",
    marginTop: 4,
  },

  price: {
    color: "#38bdf8",
    marginTop: 6,
    fontWeight: "700",
  },

  badge: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  pending: {
    backgroundColor: "#eab308",
  },

  accepted: {
    backgroundColor: "#22c55e",
  },

  rejected: {
    backgroundColor: "#ef4444",
  },

  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 50,
  },
});