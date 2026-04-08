import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // ❌ remove token
      await AsyncStorage.removeItem("token");

      console.log("User logged out");

      // 🔁 go back to main screen
      router.replace("/");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Welcome! You are logged in 🎉
      </Text>

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}