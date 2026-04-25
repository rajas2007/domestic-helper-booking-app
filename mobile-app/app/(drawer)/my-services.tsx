import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function MyServices() {
  const navigation: any = useNavigation();

  const [services, setServices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const fetchServices = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      const res = await axios.get(
        `https://semester-flight-those.ngrok-free.dev/api/services/worker/${user.id}`
      );

      setServices(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  const addService = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      await axios.post(
        "https://semester-flight-those.ngrok-free.dev/api/services",
        {
          title,
          description,
          price: Number(price),
          user_id: user.id,
        }
      );

      setTitle("");
      setDescription("");
      setPrice("");

      fetchServices();
    } catch (err) {
      console.log("Add error:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchServices);
    return unsubscribe;
  }, [navigation]);

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
          <Text style={styles.title}>My Services</Text>
        </View>

        {/* LIST (with header inside) */}
        <FlatList
          data={services}
          keyExtractor={(item: any) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          
          ListHeaderComponent={
            <>
              {/* ADD SERVICE */}
              <View style={styles.card}>
                <TextInput
                  placeholder="Title"
                  placeholderTextColor="#94a3b8"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Description"
                  placeholderTextColor="#94a3b8"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Price"
                  placeholderTextColor="#94a3b8"
                  value={price}
                  onChangeText={setPrice}
                  style={styles.input}
                  keyboardType="numeric"
                />

                {/* BUTTON */}
                <TouchableOpacity
                  onPress={addService}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Add Service</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          }

          renderItem={({ item }: any) => (
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.serviceDesc}>{item.description}</Text>
              <Text style={styles.price}>₹ {item.price}</Text>
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
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    color: "#fff",
  },

  buttonWrapper: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  button: {
    padding: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  serviceCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
  },

  serviceTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  serviceDesc: {
    color: "#94a3b8",
    marginTop: 4,
  },

  price: {
    color: "#3b82f6",
    marginTop: 4,
  },
});