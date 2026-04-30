import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "../../hooks/useToast";
import { AppTheme } from "../../constants/theme";

export default function Settings() {
  const navigation: any = useNavigation();
  const toast = useToast();

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
        toast.error("User not found");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);

      const res = await api.put(
        "/api/auth/update",
        {
          id: user.id,
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
        }
      );

      // ✅ Update local storage
      const updatedUser = res.data.user || res.data;
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setPassword(""); // ✅ clear password field

      toast.success("Profile updated successfully");

    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.background }}>
      <LinearGradient
        colors={AppTheme.gradientBackground}
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
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor={AppTheme.textMuted}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor={AppTheme.textMuted}
          />

          <Text style={styles.label}>New Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Leave blank to keep current"
            placeholderTextColor={AppTheme.textMuted}
            secureTextEntry
          />
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ["#64748b", "#475569"] as const : AppTheme.gradientAccent}
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
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  menu: { fontSize: 24, color: "#fff", marginRight: 10 },
  title: { fontSize: 26, color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: AppTheme.card,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
  },

  sectionTitle: {
    color: AppTheme.textHighlight,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  label: {
    color: AppTheme.textSecondary,
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '500',
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    fontSize: 15,
  },

  buttonWrapper: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
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