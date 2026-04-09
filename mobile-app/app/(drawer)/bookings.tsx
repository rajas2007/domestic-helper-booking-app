import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function Bookings() {
  const navigation: any = useNavigation();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const parsedUser = JSON.parse(userData);

      const res = await axios.get(
        `http://192.168.31.199:5000/api/bookings/user/${parsedUser.id}`
      );

      console.log("USER BOOKINGS:", res.data); // 🔥 debug
      setBookings(res.data);

    } catch (err) {
      console.log("BOOKING FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔥 REFRESH WHEN SCREEN FOCUSES
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const getStatusColor = (status: string) => {
    if (status === "accepted") return "#22c55e";
    if (status === "rejected") return "#ef4444";
    return "#eab308"; // pending
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
            My Bookings
          </Text>
        </View>

        {/* LIST */}
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 50 }}>
              No bookings yet
            </Text>
          }
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              {/* 🔥 FIXED FIELD NAME */}
              <Text style={styles.service}>
                {item.title || "Service"}
              </Text>

              <Text style={styles.price}>₹ {item.price || "---"}</Text>

              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status?.toUpperCase()}
              </Text>
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
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  service: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  price: {
    color: "#38bdf8",
    marginTop: 5,
  },

  status: {
    marginTop: 8,
    fontWeight: "600",
  },
});