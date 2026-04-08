import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    console.log("Register Clicked");
    setLoading(true);

    try {
      console.log("Sending request...");

      const res = await axios.post("http://192.168.31.199:5000/api/auth/register", {
        name,
        email,
        password,
      });

      console.log("Response received:", res.data);

      alert("User Registered Successfully");

    } catch (err: any) {
      console.log("Error happened:");
      console.log(err?.response?.data || err?.message);

      alert(err?.response?.data?.message || "Something went wrong");

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          console.log("Name:", text);
        }}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          console.log("Email:", text);
        }}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={(text) => {
          setPassword(text);
          console.log("Password:", text);
        }}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
}