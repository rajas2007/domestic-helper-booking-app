import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { AppTheme } from "../../constants/theme";

export default function AboutScreen() {
  const navigation: any = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.background }}>
      <LinearGradient colors={AppTheme.gradientBackground} style={{ flex: 1, padding: 20 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>About</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* LOGO & APP INFO */}
          <View style={styles.appInfoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>H</Text>
            </View>
            <Text style={styles.appName}>Helperly</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          {/* DESCRIPTION CARD */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What is Helperly?</Text>
            <Text style={styles.descriptionText}>
              Helperly is a premium platform connecting homeowners with trusted, verified domestic service professionals. 
              Whether you need regular house cleaning, expert plumbing, or specialized gardening, our app makes it seamless to find and book the perfect help for your home.
            </Text>
          </View>

          {/* DEVELOPER INFO */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Developer Info</Text>
            <View style={styles.devRow}>
              <View style={styles.devAvatar}>
                <Text style={styles.devAvatarText}>D</Text>
              </View>
              <View>
                <Text style={styles.devName}>Helperly Dev Team</Text>
                <Text style={styles.devRole}>Built with React Native & Expo</Text>
              </View>
            </View>
          </View>

          {/* LINKS */}
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>📄</Text>
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>🔒</Text>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  menu: {
    fontSize: 26,
    color: "#fff",
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  appInfoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: AppTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: AppTheme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "800",
  },
  appName: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: AppTheme.textMuted,
    fontWeight: "600",
  },
  card: {
    backgroundColor: AppTheme.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: AppTheme.textSecondary,
    lineHeight: 24,
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  devAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppTheme.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  devAvatarText: {
    fontSize: 20,
    color: AppTheme.primary,
    fontWeight: "700",
  },
  devName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 4,
  },
  devRole: {
    fontSize: 13,
    color: AppTheme.textMuted,
  },
  linksContainer: {
    backgroundColor: AppTheme.card,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  linkIcon: {
    fontSize: 20,
  },
  linkText: {
    fontSize: 16,
    color: AppTheme.textSecondary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.cardBorder,
    marginLeft: 54,
  },
});
