import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

export default function Worker() {
  const navigation: any = useNavigation();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://192.168.31.199:5000/api/bookings/all");
      setBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.put(`http://192.168.31.199:5000/api/bookings/${id}`, { status });
      fetchBookings();
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
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>

  {/* HAMBURGER BUTTON */}
  <TouchableOpacity onPress={() => navigation.openDrawer()}>
    <Text style={{ fontSize: 26, color: "#fff", marginRight: 10 }}>☰</Text>
  </TouchableOpacity>

  {/* TITLE */}
  <Text style={{ fontSize: 28, color: "#fff", fontWeight: "700" }}>
    Worker Bookings
  </Text>

</View>

      <FlatList
        data={bookings}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.service}>{item.service_title}</Text>

            <Text style={{ color: "#94a3b8" }}>{item.status}</Text>

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
          </View>
        )}
      />
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    color: "#fff",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
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
