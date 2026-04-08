import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        console.log("Checking token:", token);

        if (token) {
          // ✅ If token exists → skip login
          router.replace("/home");
        }
      } catch (err) {
        console.log("Error checking token:", err);
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>Home Screen</Text>

      <Button title="Go to Register" onPress={() => router.push("/register")} />
      <View style={{ height: 10 }} />
      <Button title="Go to Login" onPress={() => router.push("/login")} />
    </View>
  );
}