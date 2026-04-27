import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { validateRegister, ValidationErrors } from "../utils/validators";
import { useToast } from "../hooks/useToast";

export default function Register() {
  const router = useRouter();
  const toast = useToast();

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearErrors = () => {
    setErrors({});
  };

  const getPasswordScore = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const getStrengthColor = (score: number) => {
    if (score <= 1) return "#ef4444"; // Red (Weak)
    if (score === 2) return "#f59e0b"; // Orange (Fair)
    if (score === 3) return "#eab308"; // Yellow (Good)
    return "#22c55e"; // Green (Strong)
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
  };

  const pwdScore = getPasswordScore(password);

  const handleRegister = async () => {
    if (loading) return;

    // Validate input
    const validationErrors = validateRegister({ name, email, password });
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    clearErrors();
    setLoading(true);

    try {
      await axios.post(
        "https://domestic-helper-booking-app.onrender.com/api/auth/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }
      );

      toast.success("Account created successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Registration failed";
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
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
        {/* NAME INPUT */}
        <View>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            placeholder="Enter your full name"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            editable={!loading}
            style={[styles.input, errors.name && styles.inputError]}
          />
          {errors.name && (
            <Text style={styles.errorMessage}>✕ {errors.name}</Text>
          )}
        </View>

        {/* EMAIL INPUT */}
        <View>
          <Text style={styles.label}>Email *</Text>
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
            keyboardType="email-address"
            style={[styles.input, errors.email && styles.inputError]}
          />
          {errors.email && (
            <Text style={styles.errorMessage}>✕ {errors.email}</Text>
          )}
        </View>

        {/* PASSWORD INPUT */}
        <View>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            placeholder="Create a password (min. 6 characters)"
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
          
          {/* PASSWORD STRENGTH INDICATOR */}
          {password.length > 0 && (
            <View style={{ marginTop: 12, paddingHorizontal: 4 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3, 4].map((index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: pwdScore >= index ? getStrengthColor(pwdScore) : "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </View>
              <Text style={{ 
                color: getStrengthColor(pwdScore), 
                fontSize: 12, 
                marginTop: 6, 
                fontWeight: '600',
                textAlign: 'right' 
              }}>
                {getStrengthLabel(pwdScore)}
              </Text>
            </View>
          )}

          {errors.password && (
            <Text style={[styles.errorMessage, { marginTop: password.length > 0 ? 4 : 6 }]}>
              ✕ {errors.password}
            </Text>
          )}
        </View>

        {/* ROLE TOGGLE */}
        <Text style={[styles.label, { marginBottom: 10 }]}>Select Role</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              role === "user" && styles.activeToggle,
            ]}
            onPress={() => setRole("user")}
            disabled={loading}
          >
            <Text style={styles.toggleText}>👤 User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              role === "worker" && styles.activeToggle,
            ]}
            onPress={() => setRole("worker")}
            disabled={loading}
          >
            <Text style={styles.toggleText}>👷 Worker</Text>
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
          colors={loading ? ["#64748b", "#475569"] : ["#3b82f6", "#6366f1"]}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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