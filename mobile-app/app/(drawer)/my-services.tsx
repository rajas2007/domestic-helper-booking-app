import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function MyServices() {
  const navigation: any = useNavigation();

  const [services, setServices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const fetchServices = async () => {
    const userData = await AsyncStorage.getItem("user");
    const user = JSON.parse(userData || "{}");

    const res = await axios.get(
      `http://192.168.31.199:5000/api/services/worker/${user.id}`
    );

    setServices(res.data);
  };

  const addService = async () => {
    const userData = await AsyncStorage.getItem("user");
    const user = JSON.parse(userData || "{}");

    await axios.post("http://192.168.31.199:5000/api/services", {
      title,
      description,
      price: Number(price),
      user_id: user.id,
    });

    setTitle("");
    setDescription("");
    setPrice("");

    fetchServices();
  };

 useEffect(() => {
  fetchServices();
}, []);

useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    fetchServices();
  });

  return unsubscribe;
}, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#020617", "#0f172a"]} style={{ flex: 1, padding: 20 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Services</Text>
        </View>

        {/* ADD SERVICE */}
        <View style={styles.card}>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
          <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />

          <TouchableOpacity onPress={addService}>
            <LinearGradient colors={["#3b82f6", "#6366f1"]} style={styles.button}>
              <Text style={{ color: "#fff" }}>Add Service</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <FlatList
          data={services}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }: any) => (
            <View style={styles.serviceCard}>
              <Text style={{ color: "#fff", fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: "#94a3b8" }}>{item.description}</Text>
              <Text style={{ color: "#3b82f6" }}>₹ {item.price}</Text>
            </View>
          )}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  menu: { fontSize: 24, color: "#fff", marginRight: 10 },
  title: { fontSize: 24, color: "#fff", fontWeight: "700" },

  card: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    color: "#fff",
  },

  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  serviceCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
  },
});