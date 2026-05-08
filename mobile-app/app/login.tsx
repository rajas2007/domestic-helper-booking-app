import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { validateLogin, ValidationErrors } from "../utils/validators";
import { useToast } from "../hooks/useToast";
import { useBookingNotification } from "../components/BookingNotificationProvider";
import api from "../utils/api";

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const { checkMissedNotifications } = useBookingNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearErrors = () => {
    setErrors({});
  };

  const handleLogin = async () => {
    if (loading) return;

    // Validate input
    const validationErrors = validateLogin({ email, password });
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    clearErrors();
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });

      // ✅ Store token securely
      await SecureStore.setItemAsync('token', res.data.token);

      // Store non-sensitive user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify({
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role
      }));

      // Check for missed notifications after login
      await checkMissedNotifications();

      router.replace("/(drawer)/home");

    } catch (err: any) {
      if (!err?.response) {
        // Network error or timeout (e.g., Render server sleeping)
        toast.error("Server is waking up, please wait and try again");
      } else if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        const errorMsg = err?.response?.data?.message || "Login failed";
        toast.error(errorMsg);
      }
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
        {/* EMAIL INPUT */}
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            editable={!loading}
            style={[styles.input, errors.email && styles.inputError]}
          />
          {errors.email && (
            <Text style={styles.errorMessage}>✕ {errors.email}</Text>
          )}
        </View>

        {/* PASSWORD INPUT */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            editable={!loading}
            style={[styles.input, errors.password && styles.inputError]}
          />
          {errors.password && (
            <Text style={styles.errorMessage}>✕ {errors.password}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{ marginTop: 40 }}
      >
        <LinearGradient
          colors={loading ? ["#64748b", "#475569"] : ["#3b82f6", "#6366f1"]}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
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
  label: {
    color: "#cbd5f5",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 16,
    color: "#fff",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    fontSize: 16,
  },

  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  errorMessage: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
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