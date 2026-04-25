import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function Settings() {
  const navigation: any = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setName(user.name);
        setEmail(user.email);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
        alert("User not found");
        setLoading(false); // ✅ FIX
        return;
      }

      const user = JSON.parse(userData);

      const res = await axios.put(
        "https://domestic-helper-booking-app.onrender.com/api/auth/update",
        {
          id: user.id,
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
        }
      );

      // ✅ Update local storage
      await AsyncStorage.setItem("user", JSON.stringify(res.data));

      setPassword(""); // ✅ clear password field

      alert("Profile updated successfully");

    } catch (err: any) {
      console.log("Update error:", err?.response?.data || err.message);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#64748b"
            secureTextEntry
          />
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={handleSave}
          disabled={loading} // ✅ prevents spam
        >
          <LinearGradient
            colors={["#3b82f6", "#6366f1"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  label: {
    color: "#94a3b8",
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  button: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});