import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput, ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../utils/errorHandler";
import { EmptyState } from "../../components/EmptyState";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { AppTheme, SERVICE_CATEGORIES, ServiceCategoryId } from "../../constants/theme";
import api from "../../utils/api";

export default function HomeScreen() {
  const navigation: any = useNavigation();
  const [services, setServices] = useState<any[]>([]);
  const [bookedServices, setBookedServices] = useState<number[]>([]);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId>("all");
  const toast = useToast();

  const fetchServices = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");
      const res = await api.get("/api/services");
      const filtered = res.data.filter((s: any) => s.worker_id !== user.id);
      setServices(filtered);
    } catch (err: any) { toast.error(getErrorMessage(err)); }
  }, [toast]);

  const fetchUserBookings = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      const res = await api.get(`/api/bookings/user/${user.id}`);
      setBookedServices(res.data.map((b: any) => b.service_id));
    } catch (err: any) { toast.error(getErrorMessage(err)); }
  }, [toast]);

  useEffect(() => { fetchServices(); fetchUserBookings(); }, [fetchServices, fetchUserBookings]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => { fetchServices(); fetchUserBookings(); });
    return unsub;
  }, [navigation, fetchServices, fetchUserBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchServices(), fetchUserBookings()]);
    setRefreshing(false);
  };

  const detectCategory = useCallback((title: string, desc: string): ServiceCategoryId => {
    const text = `${title} ${desc}`.toLowerCase();
    for (const cat of SERVICE_CATEGORIES) {
      if (cat.id === 'all' || cat.id === 'other') continue;
      if (cat.keywords.some((kw: string) => text.includes(kw))) return cat.id;
    }
    return 'other';
  }, []);

  const filteredServices = useMemo(() => {
    let result = services;
    if (selectedCategory !== "all") {
      result = result.filter((s: any) => detectCategory(s.title || "", s.description || "") === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s: any) => s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
    }
    return result;
  }, [services, selectedCategory, searchQuery, detectCategory]);

  const handleBooking = async (serviceId: number) => {
    if (bookingLoading) return;
    setBookingLoading(serviceId);
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");
      await api.post("/api/bookings/book", { service_id: serviceId, user_id: user.id });
      setBookedServices((prev) => [...prev, serviceId]);
      toast.success("Booked successfully");
    } catch (err: any) { toast.error(getErrorMessage(err)); }
    finally { setBookingLoading(null); }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    return colors[(name || '').charCodeAt(0) % colors.length];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.background }}>
      <LinearGradient colors={AppTheme.gradientBackground} style={{ flex: 1, padding: 20 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}><Text style={styles.menu}>☰</Text></TouchableOpacity>
          <Text style={styles.title}>Explore</Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput placeholder="Search services..." placeholderTextColor={AppTheme.textMuted} value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} />
          {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery("")}><Text style={styles.clearSearch}>✕</Text></TouchableOpacity>}
        </View>

        {/* CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {SERVICE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return active ? (
              <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)} activeOpacity={0.7}>
                <LinearGradient colors={AppTheme.gradientPrimary} style={styles.catChipActive}>
                  <Text style={styles.catIcon}>{cat.icon}</Text><Text style={styles.catLabelActive}>{cat.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)} activeOpacity={0.7} style={styles.catChip}>
                <Text style={styles.catIcon}>{cat.icon}</Text><Text style={styles.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LIST */}
        <FlatList
          data={filteredServices}
          keyExtractor={(item: any) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppTheme.primary]} tintColor={AppTheme.primary} />}
          ListEmptyComponent={
            searchQuery.trim() || selectedCategory !== "all" ? (
              <EmptyState icon="🔍" title="No results found" subtitle="Try a different search term or category" actionLabel="Clear Filters" onAction={() => { setSearchQuery(""); setSelectedCategory("all"); }} />
            ) : (
              <EmptyState icon="🏠" title="No services available" subtitle="Services will appear here once workers add them" />
            )
          }
          renderItem={({ item }: any) => {
            const isBooked = bookedServices.includes(item.id);
            const wName = item.worker_name || "Worker";
            const avColor = getAvatarColor(wName);
            return (
              <AnimatedPressable style={styles.card}>
                <View style={styles.workerRow}>
                  <View style={[styles.workerAvatar, { backgroundColor: avColor + '25', borderColor: avColor + '40' }]}>
                    <Text style={[styles.workerAvatarText, { color: avColor }]}>{wName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.workerName}>{wName}</Text>
                </View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.bottomRow}>
                  <Text style={styles.price}>₹ {item.price}</Text>
                  {isBooked ? (
                    <View style={styles.bookedBtn}><Text style={styles.btnText}>Booked ✓</Text></View>
                  ) : (
                    <TouchableOpacity style={styles.bookBtn} onPress={() => handleBooking(item.id)} disabled={bookingLoading === item.id} activeOpacity={0.7}>
                      {bookingLoading === item.id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Book Now</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </AnimatedPressable>
            );
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  menu: { fontSize: 26, color: "#fff", marginRight: 10 },
  title: { fontSize: 28, color: "#fff", fontWeight: "700" },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppTheme.card, borderRadius: 14, borderWidth: 1, borderColor: AppTheme.cardBorder, paddingHorizontal: 14, marginBottom: 14, height: 48 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: AppTheme.textPrimary, fontSize: 15, height: '100%' as any },
  clearSearch: { color: AppTheme.textMuted, fontSize: 16, padding: 4 },
  catScroll: { marginBottom: 16, flexGrow: 0, minHeight: 50 },
  catContent: { gap: 8, paddingRight: 20, alignItems: 'center' },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppTheme.card, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: AppTheme.cardBorder, gap: 6, flexShrink: 0 },
  catChipActive: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, gap: 6, flexShrink: 0 },
  catIcon: { fontSize: 14 },
  catLabel: { color: AppTheme.textSecondary, fontSize: 13, fontWeight: '500' },
  catLabelActive: { color: '#fff', fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: AppTheme.card, padding: 18, borderRadius: 18, marginBottom: 16, borderWidth: 1, borderColor: AppTheme.cardBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  workerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  workerAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  workerAvatarText: { fontSize: 14, fontWeight: '700' },
  workerName: { color: AppTheme.textSecondary, fontSize: 13, fontWeight: '500' },
  serviceTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  description: { color: AppTheme.textSecondary, marginBottom: 12, lineHeight: 20, fontSize: 15 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  price: { color: AppTheme.priceColor, fontWeight: "700", fontSize: 17 },
  bookBtn: { backgroundColor: AppTheme.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  bookedBtn: { backgroundColor: AppTheme.success, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "600" },
});