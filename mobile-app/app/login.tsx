import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    console.log("Login Clicked");
    setLoading(true);

    try {
      console.log("Sending login request...");

      const res = await axios.post("http://192.168.31.199:5000/api/auth/login", {
        email,
        password,
      });

      console.log("Login Response:", res.data);

      await AsyncStorage.setItem("token", res.data.token);

      const token = await AsyncStorage.getItem("token");
      console.log("Stored Token:", token);

      alert("Login Successful");

      // ✅ redirect to home
      router.replace("/home" as any);

    } catch (err: any) {
      console.log("Login Error:", err?.response?.data || err?.message);

      alert(err?.response?.data?.message || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}