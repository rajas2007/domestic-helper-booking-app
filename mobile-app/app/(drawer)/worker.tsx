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

      console.log("WORKER BOOKINGS:", res.data);
      setBookings(res.data);

    } catch (err) {
      console.log("WORKER FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔥 Refresh when screen opens
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

      fetchBookings(); // refresh after update
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#020617", "#020617", "#0f172a"]}
        style={{ flex: 1, padding: 20 }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={{ fontSize: 26, color: "#fff", marginRight: 10 }}>☰</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 28, color: "#fff", fontWeight: "700" }}>
            Worker Bookings
          </Text>
        </View>

        {/* LIST */}
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 50 }}>
              No booking requests
            </Text>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              {/* 🔥 FIXED FIELD */}
              <Text style={styles.service}>{item.title}</Text>

              <Text style={{ color: "#94a3b8", marginTop: 5 }}>
                Status: {item.status}
              </Text>

              {/* SHOW BUTTONS ONLY IF PENDING */}
              {item.status === "pending" && (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.accept}
                    onPress={() => updateStatus(item.id, "accepted")}
                  >
                    <Text style={{ color: "#fff" }}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reject}
                    onPress={() => updateStatus(item.id, "rejected")}
                  >
                    <Text style={{ color: "#fff" }}>Reject</Text>
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
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  service: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  accept: {
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 8,
  },

  reject: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
  },
});