import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Worker() {
  const navigation: any = useNavigation();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await axios.get(
        `http://192.168.31.199:5000/api/bookings/worker/${user.id}`
      );

      setBookings(res.data);

    } catch (err) {
      console.log("WORKER FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.put(
        `http://192.168.31.199:5000/api/bookings/${id}`,
        { status }
      );

      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === "accepted") return styles.accepted;
    if (status === "rejected") return styles.rejected;
    return styles.pending;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#020617", "#020617", "#0f172a"]}
        style={{ flex: 1, padding: 20 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Worker Bookings</Text>
        </View>

        {/* LIST */}
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No booking requests</Text>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              
              {/* TITLE */}
              <Text style={styles.service}>{item.title}</Text>

              {/* DESCRIPTION */}
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}

              {/* PRICE */}
              <Text style={styles.price}>₹ {item.price}</Text>

              {/* STATUS BADGE */}
              <View style={[styles.badge, getStatusStyle(item.status)]}>
                <Text style={styles.badgeText}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>

              {/* ACTION BUTTONS */}
              {item.status === "pending" && (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.accept}
                    onPress={() => updateStatus(item.id, "accepted")}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reject}
                    onPress={() => updateStatus(item.id, "rejected")}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          )}
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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

  row: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  accept: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  reject: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 50,
  },
});