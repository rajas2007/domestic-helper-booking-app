import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

export default function Register() {
  const router = useRouter();

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    // ✅ VALIDATION
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://192.168.31.199:5000/api/auth/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }
      );

      alert("Registered successfully");
      router.push("/login");

    } catch (err: any) {
      alert(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#020617", "#0f172a"]}
      style={{ flex: 1, padding: 20 }}
    >
      {/* BACK */}
      <Text
        style={{ color: "#94a3b8", marginTop: 40 }}
        onPress={() => router.back()}
      >
        ← Back
      </Text>

      {/* HEADER */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 34, color: "#fff", fontWeight: "700" }}>
          Helperly
        </Text>
        <Text style={{ color: "#94a3b8", marginTop: 5 }}>
          Create your account
        </Text>
      </View>

      {/* FORM */}
      <View style={{ marginTop: 30 }}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Enter your full name"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Create a password"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {/* ROLE TOGGLE */}
        <Text style={styles.label}>Select Role</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              role === "user" && styles.activeToggle,
            ]}
            onPress={() => setRole("user")}
          >
            <Text style={styles.toggleText}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              role === "worker" && styles.activeToggle,
            ]}
            onPress={() => setRole("worker")}
          >
            <Text style={styles.toggleText}>Worker</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        onPress={handleRegister}
        style={{ marginTop: 30 }}
        disabled={loading}
      >
        <LinearGradient
          colors={["#3b82f6", "#6366f1"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* FOOTER */}
      <Text style={styles.footer}>
        Already have an account?{" "}
        <Text
          style={{ color: "#3b82f6" }}
          onPress={() => router.push("/login")}
        >
          Login
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

  label: {
    color: "#cbd5f5",
    marginTop: 15,
    marginBottom: 6,
  },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 4,
    marginTop: 10,
  },

  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 10,
  },

  activeToggle: {
    backgroundColor: "#3b82f6",
  },

  toggleText: {
    color: "#fff",
  },
});