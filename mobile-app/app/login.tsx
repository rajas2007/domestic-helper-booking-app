import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post(
        "http://192.168.31.199:5000/api/auth/login",
        { email, password }
      );

      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      router.replace("/(drawer)/home");

    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#020617", "#0f172a"]}
      style={{ flex: 1, padding: 20 }}
    >
      <Text
        style={{ color: "#94a3b8", marginTop: 40 }}
        onPress={() => router.back()}
      >
        ← Back
      </Text>

      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 34, color: "#fff", fontWeight: "700" }}>
          Helperly
        </Text>
        <Text style={{ color: "#94a3b8", marginTop: 5 }}>
          Welcome back
        </Text>
      </View>

      <View style={{ marginTop: 40 }}>
        <Text style={{ color: "#cbd5f5", marginBottom: 6 }}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={{ color: "#cbd5f5", marginTop: 20, marginBottom: 6 }}>
          Password
        </Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <TouchableOpacity onPress={handleLogin} style={{ marginTop: 40 }}>
        <LinearGradient
          colors={["#3b82f6", "#6366f1"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Text
          style={{ color: "#3b82f6" }}
          onPress={() => router.push("/register")}
        >
          Register
        </Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 16,
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

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 20,
  },
});