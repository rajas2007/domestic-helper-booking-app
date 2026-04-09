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
  const [bookedServices, setBookedServices] = useState<number[]>([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://192.168.31.199:5000/api/services");
      setServices(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await axios.get(
        `http://192.168.31.199:5000/api/bookings/user/${user.id}`
      );

      const bookedIds = res.data.map((b: any) => b.service_id);
      setBookedServices(bookedIds);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchUserBookings();
  }, []);

  const handleBooking = async (serviceId: number) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      await axios.post("http://192.168.31.199:5000/api/bookings/book", {
        service_id: serviceId,
        user_id: user.id,
      });

      setBookedServices((prev) => [...prev, serviceId]);
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
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Explore</Text>
        </View>

        {/* LIST */}
        <FlatList
          data={services}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }: any) => {
            const isBooked = bookedServices.includes(item.id);

            return (
              <View style={styles.card}>
                {/* TITLE */}
                <Text style={styles.serviceTitle}>{item.title}</Text>

                {/* DESCRIPTION */}
                <Text style={styles.description}>{item.description}</Text>

                {/* FOOTER */}
                <View style={styles.bottomRow}>
                  <Text style={styles.price}>₹ {item.price}</Text>

                  {isBooked ? (
                    <View style={styles.bookedButton}>
                      <Text style={styles.buttonText}>Booked ✓</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => handleBooking(item.id)}
                    >
                      <Text style={styles.buttonText}>Book</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  serviceTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
  },

  description: {
    color: "#94a3b8",
    marginTop: 6,
    lineHeight: 18,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  price: {
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: 16,
  },

  bookButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  bookedButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});