import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const navigation: any = useNavigation();
  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://192.168.31.199:5000/api/services");
      setServices(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleBooking = async (serviceId: number) => {
    try {
      const userData = await AsyncStorage.getItem("user");
const user = JSON.parse(userData || "{}");

await axios.post("http://192.168.31.199:5000/api/bookings/book", {
  service_id: serviceId,
  user_id: user.id,
});

      alert("Booked successfully");
    } catch (err) {
      alert("Booking failed");
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
        Explore
        </Text>

      </View>
      {/* SERVICES LIST */}
      <FlatList
        data={services}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.bottomRow}>
              <Text style={styles.price}>₹ {item.price}</Text>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBooking(item.id)}
              >
                <Text style={{ color: "#fff" }}>Book</Text>
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
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  serviceTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  description: {
    color: "#94a3b8",
    marginTop: 5,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  price: {
    color: "#38bdf8",
    fontWeight: "600",
  },

  bookButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});