import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { validateService, ValidationErrors } from "../../utils/validators";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../utils/errorHandler";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { EmptyState } from "../../components/EmptyState";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { AppTheme } from "../../constants/theme";

export default function MyServices() {
  const navigation: any = useNavigation();
  const toast = useToast();

  const [services, setServices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; serviceId: number | null; serviceName: string }>({
    visible: false, serviceId: null, serviceName: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setFetching(true);
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");
      const res = await api.get(`/api/services/worker/${user.id}`);
      setServices(res.data);
    } catch (err: any) { toast.error(getErrorMessage(err)); }
    finally { setFetching(false); }
  }, [toast]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const clearErrors = () => setErrors({});

  const addService = async () => {
    const validationErrors = validateService({ title, description, price });
    if (validationErrors) { setErrors(validationErrors); return; }
    setLoading(true); clearErrors();
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");
      await api.post("/api/services", {
        title, description, price: Number(price), worker_id: user.id,
      });
      setTitle(""); setDescription(""); setPrice("");
      toast.success("Service added successfully!");
      fetchServices();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || getErrorMessage(err);
      if (err?.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  // Edit
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditPrice(String(item.price));
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditErrors({});
  };

  const saveEdit = async () => {
    const validationErrors = validateService({ title: editTitle, description: editDescription, price: editPrice });
    if (validationErrors) { setEditErrors(validationErrors); return; }
    setEditLoading(true);
    try {
      await api.put(`/api/services/${editingId}`, {
        title: editTitle, description: editDescription, price: Number(editPrice),
      });
      toast.success("Service updated!");
      setEditingId(null);
      fetchServices();
    } catch (err: any) { toast.error(getErrorMessage(err)); }
    finally { setEditLoading(false); }
  };

  // Delete
  const confirmDelete = (item: any) => {
    setDeleteModal({ visible: true, serviceId: item.id, serviceName: item.title });
  };

  const handleDelete = async () => {
    if (!deleteModal.serviceId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/services/${deleteModal.serviceId}`);
      toast.success("Service deleted");
      setDeleteModal({ visible: false, serviceId: null, serviceName: "" });
      fetchServices();
    } catch (err: any) { toast.error(getErrorMessage(err)); }
    finally { setDeleteLoading(false); }
  };

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => {
    const unsub = navigation.addListener("focus", fetchServices);
    return unsub;
  }, [navigation, fetchServices]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.background }}>
      <LinearGradient colors={AppTheme.gradientBackground} style={{ flex: 1, padding: 20 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}><Text style={styles.menu}>☰</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>My Services</Text>
        </View>

        {fetching ? (
          <View style={styles.centerContainer}><ActivityIndicator size="large" color={AppTheme.primary} /></View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppTheme.primary]} tintColor={AppTheme.primary} />}
            ListHeaderComponent={
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Add New Service</Text>
                <View>
                  <Text style={styles.label}>Service Title *</Text>
                  <TextInput placeholder="e.g., House Cleaning" placeholderTextColor="#94a3b8" value={title}
                    onChangeText={(t) => { setTitle(t); if (errors.title) setErrors({ ...errors, title: undefined }); }}
                    style={[styles.input, errors.title && styles.inputError]} />
                  {errors.title && <Text style={styles.errorMessage}>✕ {errors.title}</Text>}
                </View>
                <View>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput placeholder="Describe your service" placeholderTextColor="#94a3b8" value={description}
                    onChangeText={(t) => { setDescription(t); if (errors.description) setErrors({ ...errors, description: undefined }); }}
                    multiline numberOfLines={4} style={[styles.input, styles.textArea, errors.description && styles.inputError]} />
                  {errors.description && <Text style={styles.errorMessage}>✕ {errors.description}</Text>}
                </View>
                <View>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput placeholder="e.g., 500" placeholderTextColor="#94a3b8" value={price}
                    onChangeText={(t) => { setPrice(t); if (errors.price) setErrors({ ...errors, price: undefined }); }}
                    keyboardType="decimal-pad" style={[styles.input, errors.price && styles.inputError]} />
                  {errors.price && <Text style={styles.errorMessage}>✕ {errors.price}</Text>}
                </View>
                <TouchableOpacity onPress={addService} disabled={loading} style={styles.buttonWrapper}>
                  <LinearGradient colors={loading ? ["#64748b", "#475569"] as const : AppTheme.gradientPrimary} style={styles.button}>
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Add Service</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={<EmptyState icon="🛠️" title="No services added yet" subtitle="Add your first service to get started" />}
            renderItem={({ item }: any) => {
              const isEditing = editingId === item.id;
              return (
                <AnimatedPressable style={styles.serviceCard}>
                  {isEditing ? (
                    <View>
                      <TextInput value={editTitle} onChangeText={setEditTitle} style={[styles.editInput, editErrors.title && styles.inputError]} placeholder="Title" placeholderTextColor="#64748b" />
                      {editErrors.title && <Text style={styles.errorMessage}>✕ {editErrors.title}</Text>}
                      <TextInput value={editDescription} onChangeText={setEditDescription} style={[styles.editInput, styles.textArea, editErrors.description && styles.inputError]} placeholder="Description" placeholderTextColor="#64748b" multiline />
                      {editErrors.description && <Text style={styles.errorMessage}>✕ {editErrors.description}</Text>}
                      <TextInput value={editPrice} onChangeText={setEditPrice} style={[styles.editInput, editErrors.price && styles.inputError]} placeholder="Price" placeholderTextColor="#64748b" keyboardType="decimal-pad" />
                      {editErrors.price && <Text style={styles.errorMessage}>✕ {editErrors.price}</Text>}
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={saveEdit} disabled={editLoading}>
                          <LinearGradient colors={AppTheme.gradientPrimary} style={styles.editBtn}>
                            {editLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.editBtnText}>Save</Text>}
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={cancelEdit} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.serviceTitle}>{item.title}</Text>
                      <Text style={styles.serviceDesc}>{item.description}</Text>
                      <Text style={styles.price}>₹ {item.price}</Text>
                      <View style={styles.serviceActions}>
                        <TouchableOpacity onPress={() => startEdit(item)} style={styles.editActionBtn}>
                          <Text style={styles.editActionText}>✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteActionBtn}>
                          <Text style={styles.deleteActionText}>🗑️ Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </AnimatedPressable>
              );
            }}
          />
        )}
      </LinearGradient>

      <ConfirmationModal
        visible={deleteModal.visible}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteModal.serviceName}"? This cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ visible: false, serviceId: null, serviceName: "" })}
        type="danger"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  menu: { fontSize: 26, color: "#fff", marginRight: 10 },
  headerTitle: { fontSize: 28, color: "#fff", fontWeight: "700" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 20, padding: 15, backgroundColor: AppTheme.card, borderRadius: 16, borderWidth: 1, borderColor: AppTheme.cardBorder },
  cardTitle: { fontSize: 18, fontWeight: "600", color: AppTheme.textHighlight, marginBottom: 15 },
  label: { color: AppTheme.textHighlight, marginBottom: 6, fontSize: 14, fontWeight: "500" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", marginBottom: 10, padding: 12, borderRadius: 10, color: "#fff", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)" },
  inputError: { borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)" },
  textArea: { textAlignVertical: "top", minHeight: 80 },
  errorMessage: { color: "#ef4444", fontSize: 12, marginTop: -8, marginBottom: 10 },
  buttonWrapper: { marginTop: 15, borderRadius: 10, overflow: "hidden" },
  button: { padding: 15, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  serviceCard: { padding: 15, borderRadius: 16, backgroundColor: AppTheme.card, marginBottom: 10, borderWidth: 1, borderColor: AppTheme.cardBorder },
  serviceTitle: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 5 },
  serviceDesc: { fontSize: 14, color: AppTheme.textHighlight, marginBottom: 8 },
  price: { fontSize: 15, fontWeight: "700", color: AppTheme.primary },
  serviceActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editActionBtn: { backgroundColor: AppTheme.primaryGlow, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)' },
  editActionText: { color: AppTheme.primary, fontWeight: '600', fontSize: 13 },
  deleteActionBtn: { backgroundColor: AppTheme.statusRejectedBg, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: AppTheme.statusRejectedBorder },
  deleteActionText: { color: AppTheme.statusRejected, fontWeight: '600', fontSize: 13 },
  editInput: { backgroundColor: "rgba(255,255,255,0.05)", marginBottom: 8, padding: 10, borderRadius: 10, color: "#fff", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", fontSize: 14 },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  editBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  editBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  cancelBtnText: { color: AppTheme.textHighlight, fontWeight: '600' },
});