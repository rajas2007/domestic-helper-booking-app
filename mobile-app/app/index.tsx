import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        router.replace("/(drawer)/home"); // FORCE drawer entry
      }
    };

    checkLogin();
  }, [router]);

  return (
    <LinearGradient
      colors={["#020617", "#020617", "#0f172a"]}
      style={{ flex: 1, padding: 24, justifyContent: "space-between" }}
    >
      {/* TOP SECTION */}
      <View style={{ alignItems: "center", marginTop: 80 }}>
        
        {/* ICON BOX */}
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: "#4f46e5",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <Text style={{ color: "white", fontSize: 30 }}>✦</Text>
        </View>

        {/* TITLE */}
        <Text
          style={{
            fontSize: 34,
            fontWeight: "700",
            color: "#fff",
            marginBottom: 10,
          }}
        >
          Helperly
        </Text>

        {/* SUBTITLE */}
        <Text
          style={{
            fontSize: 15,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          Find trusted domestic help easily
        </Text>
      </View>

      {/* BUTTONS */}
      <View>
        {/* LOGIN (Gradient) */}
        <TouchableOpacity onPress={() => router.push("/login")}>
          <LinearGradient
            colors={["#3b82f6", "#6366f1"]}
            style={{
              padding: 16,
              borderRadius: 14,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Login
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* REGISTER */}
        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={{
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Text style={{ color: "#e2e8f0", fontSize: 16 }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <Text
        style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: 13,
          marginBottom: 10,
        }}
      >
        Professional. Trusted. Easy.
      </Text>
    </LinearGradient>
  );
}