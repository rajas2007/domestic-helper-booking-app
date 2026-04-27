import { Stack } from "expo-router";
import { ToastProvider } from "../components/ToastProvider";
import { BookingNotificationProvider } from "../components/BookingNotificationProvider";

export default function RootLayout() {
  return (
    <BookingNotificationProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />

          {/* THIS IS IMPORTANT */}
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </BookingNotificationProvider>
  );
}