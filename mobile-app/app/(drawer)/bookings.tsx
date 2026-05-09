import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../utils/errorHandler";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { AppTheme } from "../../constants/theme";

export default function MyBookings() {
  const navigation: any = useNavigation();

  const [bookings, setBookings] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const toast = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await api.get(
        `/api/bookings/user/${user.id}`
      );

      setBookings(res.data);

    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  }, [toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "focus",
      fetchBookings
    );

    return unsubscribe;
  }, [navigation, fetchBookings]);

  // Poll booking updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchBookings]);

  const onRefresh = async () => {
    setRefreshing(true);

    await fetchBookings();

    setRefreshing(false);
  };

  const toggleDropdown = (id: number) => {
    setExpandedId((prev) =>
      prev === id ? null : id
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: AppTheme.background,
      }}
    >
      <LinearGradient
        colors={AppTheme.gradientBackground}
        style={{ flex: 1, padding: 20 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
          >
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            My Bookings
          </Text>
        </View>

        {/* LIST */}
        <FlatList
          data={bookings}
          keyExtractor={(item: any) =>
            item.id.toString()
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[AppTheme.primary]}
              tintColor={AppTheme.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="No bookings yet"
              subtitle="Your booking history will appear here once you book a service"
            />
          }
          renderItem={({ item }: any) => {
            const isExpanded =
              expandedId === item.id;

            return (
              <AnimatedPressable
                style={styles.card}
              >
                {/* TITLE */}
                <Text style={styles.service}>
                  {item.title}
                </Text>

                {/* DESCRIPTION */}
                <Text style={styles.description}>
                  {item.description}
                </Text>

                {/* PRICE */}
                <Text style={styles.price}>
                  ₹ {item.price}
                </Text>

                {/* STATUS */}
                <StatusBadge status={item.status} />

                {/* DETAILS */}
                {item.status === "accepted" && (
                  <>
                    <TouchableOpacity
                      onPress={() =>
                        toggleDropdown(item.id)
                      }
                    >
                      <Text style={styles.detailsLink}>
                        {isExpanded
                          ? "Hide Details ▲"
                          : "View Details ▼"}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View
                        style={
                          styles.detailsContainer
                        }
                      >
                        <View
                          style={styles.detailRow}
                        >
                          <View
                            style={
                              styles.detailAvatar
                            }
                          >
                            <Text
                              style={
                                styles.detailAvatarText
                              }
                            >
                              {item.worker_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "W"}
                            </Text>
                          </View>

                          <View>
                            <Text
                              style={
                                styles.detailLabel
                              }
                            >
                              Worker
                            </Text>

                            <Text
                              style={
                                styles.detailValue
                              }
                            >
                              {item.worker_name}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={styles.detailRow}
                        >
                          <Text
                            style={
                              styles.detailIcon
                            }
                          >
                            ✉️
                          </Text>

                          <View>
                            <Text
                              style={
                                styles.detailLabel
                              }
                            >
                              Email
                            </Text>

                            <Text
                              style={
                                styles.detailValue
                              }
                            >
                              {item.worker_email}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </AnimatedPressable>
            );
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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

  card: {
    backgroundColor: AppTheme.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppTheme.cardBorder,
  },

  service: {
    color: AppTheme.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  description: {
    color: AppTheme.textSecondary,
    marginTop: 4,
  },

  price: {
    color: AppTheme.priceColor,
    marginTop: 6,
    fontWeight: "700",
  },

  detailsLink: {
    color: AppTheme.primary,
    marginTop: 12,
    fontWeight: "500",
  },

  detailsContainer: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  detailAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },

  detailAvatarText: {
    color: AppTheme.primary,
    fontWeight: "700",
    fontSize: 16,
  },

  detailIcon: {
    fontSize: 20,
    width: 36,
    textAlign: "center",
  },

  detailLabel: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },

  detailValue: {
    color: AppTheme.textHighlight,
    fontSize: 14,
    fontWeight: "500",
  },
});