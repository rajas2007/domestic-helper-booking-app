import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../utils/errorHandler";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { useBookingNotification } from "../../components/BookingNotificationProvider";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { AppTheme } from "../../constants/theme";

export default function Worker() {
  const navigation: any = useNavigation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null); // ✅ dropdown state
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    bookingId: number | null;
    action: 'accept' | 'reject' | null;
    title: string;
    message: string;
  }>({
    visible: false,
    bookingId: null,
    action: null,
    title: '',
    message: '',
  });
  const toast = useToast();
  const { showBookingDecision } = useBookingNotification();

  const fetchBookings = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await axios.get(
        `https://domestic-helper-booking-app.onrender.com/api/bookings/worker/${user.id}`
      );

      setBookings(res.data);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const updateStatus = async (id: number, status: string) => {
    if (updatingStatus) return; // Prevent multiple updates

    setUpdatingStatus(id);

    try {
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      await axios.put(
        `https://domestic-helper-booking-app.onrender.com/api/bookings/${id}`,
        { status }
      );

      fetchBookings();

      // Show animated booking decision modal
      if (status === "accepted") {
        showBookingDecision(
          "accepted",
          booking.title,
          booking.user?.name || "User",
          booking.worker?.name || "Worker"
        );
      } else if (status === "rejected") {
        showBookingDecision(
          "rejected",
          booking.title,
          booking.user?.name || "User",
          booking.worker?.name || "Worker"
        );
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleDropdown = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const showConfirmation = (bookingId: number, action: 'accept' | 'reject') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setConfirmationModal({
      visible: true,
      bookingId,
      action,
      title: action === 'accept' ? 'Accept Booking' : 'Reject Booking',
      message: `Are you sure you want to ${action} the booking for "${booking.title}"?`,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationModal.bookingId || !confirmationModal.action) return;

    const { bookingId, action } = confirmationModal;
    setConfirmationModal({ visible: false, bookingId: null, action: null, title: '', message: '' });

    await updateStatus(bookingId, action === 'accept' ? 'accepted' : 'rejected');
  };

  const handleCancelAction = () => {
    setConfirmationModal({ visible: false, bookingId: null, action: null, title: '', message: '' });
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

          <Text style={styles.title}>Worker Bookings</Text>
        </View>

        {/* LIST */}
        <FlatList
          data={bookings}
          keyExtractor={(item: any) => item.id.toString()}
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
              icon="👷"
              title="No booking requests"
              subtitle="New booking requests from users will appear here"
            />
          }
          renderItem={({ item }: any) => {
            const isExpanded = expandedId === item.id;

            return (
              <AnimatedPressable style={styles.card}>
                
                {/* TITLE */}
                <Text style={styles.service}>{item.title}</Text>

                {/* DESCRIPTION */}
                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}

                {/* PRICE */}
                <Text style={styles.price}>₹ {item.price}</Text>

                {/* STATUS BADGE */}
                <StatusBadge status={item.status} />

                {/* ACTION BUTTONS */}
                {item.status === "pending" && (
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.accept}
                      onPress={() => showConfirmation(item.id, 'accept')}
                      disabled={updatingStatus === item.id}
                      activeOpacity={0.7}
                    >
                      {updatingStatus === item.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>✓ Accept</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reject}
                      onPress={() => showConfirmation(item.id, 'reject')}
                      disabled={updatingStatus === item.id}
                      activeOpacity={0.7}
                    >
                      {updatingStatus === item.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>✕ Reject</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* DROPDOWN (ONLY WHEN ACCEPTED) */}
                {item.status === "accepted" && (
                  <>
                    <TouchableOpacity onPress={() => toggleDropdown(item.id)}>
                      <Text style={styles.detailsLink}>
                        {isExpanded ? "Hide Details ▲" : "View Details ▼"}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                          <View style={styles.detailAvatar}>
                            <Text style={styles.detailAvatarText}>
                              {item.user_name?.charAt(0)?.toUpperCase() || "U"}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.detailLabel}>Booked by</Text>
                            <Text style={styles.detailValue}>{item.user_name}</Text>
                          </View>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>✉️</Text>
                          <View>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{item.user_email}</Text>
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

      <ConfirmationModal
        visible={confirmationModal.visible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.action === 'accept' ? 'Accept' : 'Reject'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        type={confirmationModal.action === 'reject' ? 'danger' : 'info'}
      />
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

  row: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  accept: {
    backgroundColor: AppTheme.statusAccepted,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  reject: {
    backgroundColor: AppTheme.statusRejected,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  detailsLink: {
    color: AppTheme.primary,
    marginTop: 12,
    fontWeight: '500',
  },

  detailsContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  detailAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  detailAvatarText: {
    color: AppTheme.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  detailIcon: {
    fontSize: 20,
    width: 36,
    textAlign: 'center',
  },

  detailLabel: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },

  detailValue: {
    color: AppTheme.textHighlight,
    fontSize: 14,
    fontWeight: '500',
  },
});