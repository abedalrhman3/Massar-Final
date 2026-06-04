import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Modal,
  ScrollView, Image, Alert, Switch
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// Haversine Distance Helper to calculate distance in meters
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Task Exploration States
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mockLocation, setMockLocation] = useState(true); // Default to true for easy local/emulator testing

  // Celebration States
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebratedXp, setCelebratedXp] = useState('');
  const [celebratedBadge, setCelebratedBadge] = useState(null);

  const budgets = ['All', 'Low', 'Medium', 'High'];
  const budgetAr = { All: 'الكل', Low: 'منخفضة', Medium: 'متوسطة', High: 'عالية' };

  const fetchLocations = async () => {
    try {
      const url = budget !== 'All' ? `/api/locations?budgetCategory=${budget}` : '/api/locations';
      const res = await api.get(url);
      setLocations(res.data);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchLocations();
  }, [budget]);

  // Request GPS and calculate distance when active location changes
  useEffect(() => {
    if (selectedLocation) {
      getGPSLocation();
    } else {
      setUserCoords(null);
      setDistance(null);
    }
  }, [selectedLocation]);

  const getGPSLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('صلاحية مطلوبة', 'يرجى السماح بالوصول للموقع لتحديد المسافة بدقة.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setUserCoords(loc.coords);

      if (selectedLocation?.coordinates) {
        const dist = getDistanceInMeters(
          loc.coords.latitude,
          loc.coords.longitude,
          selectedLocation.coordinates.lat,
          selectedLocation.coordinates.lng
        );
        setDistance(dist);
      }
    } catch (err) {
      console.log('Error getting location:', err);
    }
  };

  // Launch Camera or Picker to complete task
  const handleCompleteTask = async (taskIndex = 0) => {
    Alert.alert(
      '📷 توثيق المهمة',
      'كيف ترغب في إرفاق صورة التوثيق؟',
      [
        { text: '📸 التقاط صورة بالكاميرا', onPress: () => capturePhoto(taskIndex) },
        { text: '🖼️ اختيار من الاستوديو', onPress: () => selectFromGallery(taskIndex) },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const capturePhoto = async (taskIndex) => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحية مطلوبة', 'يرجى السماح بالوصول للكاميرا لالتقاط صورة.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.2 // Compress to prevent tunnel size limits (Network Error)
    });

    if (!result.canceled && result.assets?.length > 0) {
      submitTaskToBackend(result.assets[0].uri, taskIndex);
    }
  };

  const selectFromGallery = async (taskIndex) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.2 // Compress to prevent tunnel size limits (Network Error)
    });

    if (!result.canceled && result.assets?.length > 0) {
      submitTaskToBackend(result.assets[0].uri, taskIndex);
    }
  };

  const submitTaskToBackend = async (imageUri, taskIndex) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('photo', { uri: imageUri, name: filename, type });
      formData.append('userId', user._id);
      formData.append('locationId', selectedLocation._id);
      formData.append('taskIndex', taskIndex);

      // Location verification coordinates
      if (mockLocation) {
        // Send location coordinates directly to bypass spatial verification
        formData.append('userLat', selectedLocation.coordinates.lat);
        formData.append('userLng', selectedLocation.coordinates.lng);
      } else if (userCoords) {
        formData.append('userLat', userCoords.latitude);
        formData.append('userLng', userCoords.longitude);
      } else {
        Alert.alert('خطأ', 'لم نتمكن من تحديد موقعك الجغرافي الفعلي، جرب استخدام التوثيق الافتراضي للتجربة.');
        setSubmitting(false);
        return;
      }

      const res = await api.post('/api/user/complete-task', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        // Update user state dynamically
        await updateUser({
          total_xp: res.data.xp,
          current_level: res.data.level
        });

        // Set states and open the premium timed celebration overlay!
        setCelebratedXp(res.data.message);
        setCelebratedBadge(res.data.badge);
        setCelebrationVisible(true);

        // Hide automatically after 4.5 seconds
        setTimeout(() => {
          setCelebrationVisible(false);
        }, 4500);

        setSelectedLocation(null);
        fetchLocations();
      }
    } catch (err) {
      console.log('Task Submission Error:', err);
      Alert.alert('فشل التوثيق', err.response?.data?.error || 'حدث خطأ أثناء معالجة طلبك.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderLocation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.budgetBadge, { backgroundColor: item.budget_category === 'Low' ? '#4CAF50' : item.budget_category === 'High' ? Colors.danger : Colors.darkBlue }]}>
          <Text style={styles.budgetText}>{budgetAr[item.budget_category] || item.budget_category}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description || item.description_en}</Text>
      {item.tasks?.length > 0 ? (
        <Text style={styles.taskCount}>📋 {item.tasks.length} مهمة متاحة</Text>
      ) : null}
      <View style={styles.cardFooter}>
        <Text style={styles.xp}>🏆 {item.xp_reward || 100} XP</Text>
        {item.average_cost > 0 ? <Text style={styles.cost}>💰 {item.average_cost} JOD</Text> : null}
      </View>
      <TouchableOpacity style={styles.checkBtn} onPress={() => setSelectedLocation(item)}>
        <Text style={styles.checkBtnText}>📍 استكشاف وتوثيق الزيارة</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>مرحباً، {user?.username} 👋</Text>
          <Text style={styles.level}>🎖️ {user?.current_level || 'Explorer'}</Text>
        </View>
        <View style={styles.xpBubble}>
          <Text style={styles.xpBubbleText}>{user?.total_xp || 0}</Text>
          <Text style={styles.xpBubbleLabel}>XP</Text>
        </View>
      </View>

      {/* Budget Filter */}
      <View style={styles.filterRow}>
        {budgets.map(b => (
          <TouchableOpacity
            key={b}
            style={[styles.filterBtn, budget === b ? styles.filterBtnActive : null]}
            onPress={() => setBudget(b)}
          >
            <Text style={[styles.filterTxt, budget === b ? styles.filterTxtActive : null]}>{budgetAr[b]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading
        ? <ActivityIndicator size="large" color={Colors.mainBlue} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={locations}
            keyExtractor={item => item._id}
            renderItem={renderLocation}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLocations(); }} colors={[Colors.mainBlue]} />}
            ListEmptyComponent={<Text style={styles.empty}>لا توجد مواقع في هذه الميزانية</Text>}
          />
        )
      }

      {/* Explore & Check-in Modal */}
      {selectedLocation ? (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📍 {selectedLocation.name}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedLocation(null)}>
                  <Text style={styles.closeBtnTxt}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalDesc}>{selectedLocation.description || selectedLocation.description_en}</Text>

                {/* Distance & GPS Stats */}
                <View style={styles.statsCard}>
                  <Text style={styles.statsLabel}>🗺️ التحقق الجغرافي (Spatial Verification):</Text>
                  {distance !== null ? (
                    <Text style={[styles.statsValue, { color: distance <= 500 ? '#4CAF50' : Colors.danger }]}>
                      المسافة الحالية: {Math.round(distance)} متر 
                      {distance <= 500 ? ' (أنت قريب بما فيه الكفاية! ✅)' : ' (أنت بعيد جداً! ❌ يجب أن تكون على بعد 500 متر)'}
                    </Text>
                  ) : (
                    <Text style={styles.statsValue}>جاري تحديد إحداثيات موقعك الجغرافي... 🛰️</Text>
                  )}

                  {/* Simulator Testing Helper Switch */}
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>🛠️ وضع التجربة الافتراضية (bypass GPS):</Text>
                    <Switch
                      value={mockLocation}
                      onValueChange={setMockLocation}
                      trackColor={{ false: '#767577', true: Colors.paleBlue }}
                      thumbColor={mockLocation ? Colors.mainBlue : '#f4f3f4'}
                    />
                  </View>
                  <Text style={styles.switchHint}>* تفعيل هذا الخيار يسمح لك بتوثيق المهام وتجربة التطبيق من أي مكان دون التحقق من الـ GPS الفعلي (مثالي للمحاكيات!).</Text>
                </View>

                {/* Tasks Section */}
                <Text style={styles.tasksTitle}>📋 المهام المطلوبة في هذا المعلم السياحي:</Text>
                {selectedLocation.tasks && selectedLocation.tasks.length > 0 ? (
                  selectedLocation.tasks.map((task, idx) => (
                    <View key={idx} style={styles.taskItem}>
                      <View style={styles.taskItemHeader}>
                        <Text style={styles.taskItemName}>📍 مهمة {idx + 1}: {task.name || task.name_en || 'التقاط صورة للتوثيق'}</Text>
                        <Text style={styles.taskItemXp}>🏆 +{task.xp} XP</Text>
                      </View>
                      <Text style={styles.taskItemDesc}>{task.description || task.description_en || 'التقط صورة واضحة لهذا المعلم الأثري لربح الجائزة.'}</Text>
                      
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleCompleteTask(idx)}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <ActivityIndicator color={Colors.white} />
                        ) : (
                          <Text style={styles.actionBtnText}>📸 التقاط صورة وتوثيق المهمة</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  // Simple location check-in (no specific tasks)
                  <View style={styles.taskItem}>
                    <View style={styles.taskItemHeader}>
                      <Text style={styles.taskItemName}>📍 توثيق زيارة المعلم السياحي</Text>
                      <Text style={styles.taskItemXp}>🏆 +{selectedLocation.xp_reward || 100} XP</Text>
                    </View>
                    <Text style={styles.taskItemDesc}>التقط صورة تذكارية في هذا الموقع لتوثيق زيارتك وتأكيدها!</Text>
                    
                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => handleCompleteTask(0)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Text style={styles.actionBtnText}>📸 التقاط صورة وتأكيد الوصول</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Premium Celebration Animation Overlay */}
      <Modal visible={celebrationVisible} transparent={true} animationType="fade">
        <View style={styles.celebrationBg}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉🏆✨</Text>
            <Text style={styles.celebrationTitle}>مهمة مكتملة بنجاح!</Text>
            <Text style={styles.celebrationText}>{celebratedXp}</Text>
            {celebratedBadge ? (
              <View style={styles.celebrationBadgeContainer}>
                <Text style={styles.celebrationBadgeLabel}>🎖️ حصلت على شارة مغامرة جديدة:</Text>
                <Text style={styles.celebrationBadgeName}>{celebratedBadge.name}</Text>
              </View>
            ) : null}
            <Text style={styles.celebrationFooter}>أنت رائع! استمر في استكشاف كنوز الأردن 🇯🇴</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.primary },
  topBar:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.mainBlue, padding: 20, paddingTop: 10 },
  greeting:         { color: Colors.white, fontSize: 18, fontWeight: '800' },
  level:            { color: Colors.paleBlue, fontSize: 12, marginTop: 2 },
  xpBubble:         { backgroundColor: Colors.white, borderRadius: 50, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  xpBubbleText:     { color: Colors.mainBlue, fontWeight: '900', fontSize: 16 },
  xpBubbleLabel:    { color: Colors.darkBlue, fontSize: 9, fontWeight: '700' },
  filterRow:        { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.secondary },
  filterBtn:        { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.secondary, alignItems: 'center' },
  filterBtnActive:  { backgroundColor: Colors.mainBlue },
  filterTxt:        { color: Colors.darkBlue, fontWeight: '600', fontSize: 13 },
  filterTxtActive:  { color: Colors.white },
  list:             { padding: 16, gap: 16 },
  card:             { backgroundColor: Colors.white, borderRadius: 18, padding: 16, shadowColor: Colors.mainBlue, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle:       { fontSize: 17, fontWeight: '800', color: Colors.black, flex: 1, marginRight: 8 },
  budgetBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  budgetText:       { color: Colors.white, fontSize: 11, fontWeight: '700' },
  cardDesc:         { color: Colors.darkBlue, fontSize: 13, lineHeight: 20, marginBottom: 10 },
  taskCount:        { color: Colors.mainBlue, fontWeight: '600', fontSize: 13, marginBottom: 8 },
  cardFooter:       { flexDirection: 'row', gap: 12, marginBottom: 12 },
  xp:               { color: Colors.gold, fontWeight: '700' },
  cost:             { color: Colors.darkBlue, fontWeight: '600' },
  checkBtn:         { backgroundColor: Colors.mainBlue, borderRadius: 12, padding: 12, alignItems: 'center' },
  checkBtnText:     { color: Colors.white, fontWeight: '700', fontSize: 15 },
  empty:            { textAlign: 'center', color: Colors.darkBlue, marginTop: 40, fontSize: 15 },

  // Modal Styles
  modalBg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: Colors.primary, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', padding: 24 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.secondary, paddingBottom: 12 },
  modalTitle:       { fontSize: 20, fontWeight: '900', color: Colors.black },
  closeBtn:         { backgroundColor: Colors.secondary, borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt:      { fontSize: 16, color: Colors.darkBlue, fontWeight: '800' },
  modalScroll:      { gap: 20, paddingBottom: 40 },
  modalDesc:        { fontSize: 15, color: Colors.darkBlue, lineHeight: 22 },
  
  // Spatial Stats Styles
  statsCard:        { backgroundColor: Colors.white, borderRadius: 18, padding: 16, borderLeftWidth: 4, borderLeftColor: Colors.mainBlue },
  statsLabel:       { fontSize: 13, color: Colors.darkBlue, fontWeight: '700', marginBottom: 6 },
  statsValue:       { fontSize: 14, fontWeight: '700' },
  switchRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.secondary, paddingTop: 10 },
  switchLabel:      { fontSize: 13, fontWeight: '800', color: Colors.black },
  switchHint:       { fontSize: 11, color: Colors.darkBlue, fontStyle: 'italic', marginTop: 6, lineHeight: 15 },
  
  // Tasks Styles
  tasksTitle:       { fontSize: 16, fontWeight: '800', color: Colors.black, marginTop: 8 },
  taskItem:         { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 10, shadowColor: Colors.mainBlue, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  taskItemHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskItemName:     { fontSize: 15, fontWeight: '800', color: Colors.black, flex: 1, marginRight: 8 },
  taskItemXp:       { color: Colors.gold, fontWeight: '900', fontSize: 14 },
  taskItemDesc:     { fontSize: 13, color: Colors.darkBlue, lineHeight: 18 },
  actionBtn:        { backgroundColor: Colors.mainBlue, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 },
  actionBtnText:    { color: Colors.white, fontWeight: '800', fontSize: 14 },

  // Celebration Styles
  celebrationBg:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  celebrationCard:           { backgroundColor: Colors.white, borderRadius: 24, padding: 32, alignItems: 'center', width: '80%', shadowColor: Colors.gold, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12, borderWidth: 2, borderColor: Colors.gold },
  celebrationEmoji:          { fontSize: 56, marginBottom: 16 },
  celebrationTitle:          { fontSize: 22, fontWeight: '900', color: Colors.mainBlue, marginBottom: 8, textAlign: 'center' },
  celebrationText:           { fontSize: 16, color: Colors.darkBlue, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  celebrationBadgeContainer: { backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, alignItems: 'center', marginBottom: 16, width: '100%' },
  celebrationBadgeLabel:     { fontSize: 11, color: Colors.darkBlue, fontWeight: '600' },
  celebrationBadgeName:      { fontSize: 15, fontWeight: '800', color: Colors.mainBlue, marginTop: 4 },
  celebrationFooter:         { fontSize: 12, color: Colors.darkBlue, fontStyle: 'italic', textAlign: 'center', marginTop: 8 }
});
