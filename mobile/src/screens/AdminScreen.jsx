import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import api from '../api/client';

export default function AdminScreen() {
  const [loading, setLoading] = useState(false);
  const [budgetSettings, setBudgetSettings] = useState({ low_max: '10', mid_max: '30' });
  const [newLocation, setNewLocation] = useState({
    name: '', name_en: '', lat: '', lng: '', average_cost: '', xp_reward: '100', budget_category: 'Low', description: ''
  });
  const [newQuest, setNewQuest] = useState({
    title: '', title_en: '', description: '', bonus_xp: '200'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/admin/settings/budget');
      if (res.data) {
        setBudgetSettings({ low_max: res.data.low_max.toString(), mid_max: res.data.mid_max.toString() });
      }
    } catch (err) {
      console.log('Error fetching settings', err);
    }
  };

  const saveBudgetSettings = async () => {
    setLoading(true);
    try {
      await api.post('/api/admin/settings/budget', {
        low_max: Number(budgetSettings.low_max),
        mid_max: Number(budgetSettings.mid_max)
      });
      Alert.alert('نجاح', 'تم تحديث فلاتر الميزانية بنجاح!');
    } catch (err) {
      Alert.alert('خطأ', 'فشل في تحديث الإعدادات.');
    }
    setLoading(false);
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
      Alert.alert('خطأ', 'الرجاء تعبئة الاسم والإحداثيات (خط العرض وخط الطول).');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/admin/add-location', {
        name: newLocation.name,
        name_en: newLocation.name_en || newLocation.name,
        description: newLocation.description,
        coordinates: { lat: Number(newLocation.lat), lng: Number(newLocation.lng) },
        average_cost: Number(newLocation.average_cost),
        budget_category: newLocation.budget_category,
        xp_reward: Number(newLocation.xp_reward)
      });
      Alert.alert('نجاح', 'تمت إضافة الموقع السياحي الجديد بنجاح!');
      setNewLocation({ name: '', name_en: '', lat: '', lng: '', average_cost: '', xp_reward: '100', budget_category: 'Low', description: '' });
    } catch (err) {
      Alert.alert('خطأ', 'فشل في إضافة الموقع.');
    }
    setLoading(false);
  };

  const handleAddQuest = async () => {
    if (!newQuest.title) {
      Alert.alert('خطأ', 'الرجاء تعبئة عنوان المغامرة.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/admin/add-quest', {
        title: newQuest.title,
        title_en: newQuest.title_en || newQuest.title,
        description: newQuest.description,
        bonus_xp: Number(newQuest.bonus_xp)
      });
      Alert.alert('نجاح', 'تمت إضافة المغامرة الجديدة بنجاح!');
      setNewQuest({ title: '', title_en: '', description: '', bonus_xp: '200' });
    } catch (err) {
      Alert.alert('خطأ', 'فشل في إضافة المغامرة.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>🛠️ لوحة تحكم المدير</Text>
        <Text style={styles.subtitle}>إدارة التطبيق بالكامل من هاتفك</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Section 1: Budget Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 إعدادات فلتر الميزانية</Text>
          <Text style={styles.cardDesc}>قم بتعديل حدود الميزانية لحل مشكلة فلتر الأماكن (المنخفضة والمتوسطة والعالية).</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحد الأقصى للميزانية المنخفضة (JOD)</Text>
            <TextInput
              style={styles.input}
              value={budgetSettings.low_max}
              onChangeText={text => setBudgetSettings(prev => ({ ...prev, low_max: text }))}
              keyboardType="numeric"
              placeholder="مثال: 10"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحد الأقصى للميزانية المتوسطة (JOD)</Text>
            <TextInput
              style={styles.input}
              value={budgetSettings.mid_max}
              onChangeText={text => setBudgetSettings(prev => ({ ...prev, mid_max: text }))}
              keyboardType="numeric"
              placeholder="مثال: 30"
            />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={saveBudgetSettings} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnPrimaryTxt}>💾 حفظ الفلاتر الجديدة</Text>}
          </TouchableOpacity>
        </View>

        {/* Section 2: Add Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 إضافة معلم سياحي جديد</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المعلم (بالعربي)</Text>
            <TextInput style={styles.input} value={newLocation.name} onChangeText={t => setNewLocation(prev => ({...prev, name: t}))} placeholder="مثال: وادي رم" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المعلم (إنجليزي)</Text>
            <TextInput style={styles.input} value={newLocation.name_en} onChangeText={t => setNewLocation(prev => ({...prev, name_en: t}))} placeholder="مثال: Wadi Rum" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>وصف المعلم</Text>
            <TextInput style={styles.input} value={newLocation.description} onChangeText={t => setNewLocation(prev => ({...prev, description: t}))} placeholder="وصف قصير للموقع" multiline />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>خط العرض (Lat)</Text>
              <TextInput style={styles.input} value={newLocation.lat} onChangeText={t => setNewLocation(prev => ({...prev, lat: t}))} placeholder="29.5880" keyboardType="numeric" />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>خط الطول (Lng)</Text>
              <TextInput style={styles.input} value={newLocation.lng} onChangeText={t => setNewLocation(prev => ({...prev, lng: t}))} placeholder="35.4216" keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>التكلفة (JOD)</Text>
              <TextInput style={styles.input} value={newLocation.average_cost} onChangeText={t => setNewLocation(prev => ({...prev, average_cost: t}))} placeholder="مثال: 5" keyboardType="numeric" />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>الفئة (Low/Medium/High)</Text>
              <TextInput style={styles.input} value={newLocation.budget_category} onChangeText={t => setNewLocation(prev => ({...prev, budget_category: t}))} placeholder="Low" />
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleAddLocation} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnPrimaryTxt}>➕ إضافة المعلم للخريطة</Text>}
          </TouchableOpacity>
        </View>

        {/* Section 3: Add Quest */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗺️ إضافة مغامرة جديدة (Quest)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان المغامرة</Text>
            <TextInput style={styles.input} value={newQuest.title} onChangeText={t => setNewQuest(prev => ({...prev, title: t}))} placeholder="مثال: مغامرة الشمال" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>وصف المغامرة</Text>
            <TextInput style={styles.input} value={newQuest.description} onChangeText={t => setNewQuest(prev => ({...prev, description: t}))} placeholder="استكشف أجمل قلاع شمال الأردن..." multiline />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الجائزة الإضافية (XP)</Text>
            <TextInput style={styles.input} value={newQuest.bonus_xp} onChangeText={t => setNewQuest(prev => ({...prev, bonus_xp: t}))} placeholder="200" keyboardType="numeric" />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleAddQuest} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnPrimaryTxt}>➕ إطلاق المغامرة</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: { backgroundColor: Colors.mainBlue, padding: 20, paddingTop: 10 },
  title: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  subtitle: { color: Colors.paleBlue, fontSize: 12, marginTop: 2 },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: Colors.mainBlue, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.black, marginBottom: 8 },
  cardDesc: { fontSize: 12, color: Colors.darkBlue, marginBottom: 16, lineHeight: 18 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.darkBlue, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.secondary, borderRadius: 10, padding: 10, fontSize: 14, backgroundColor: '#fafafa', color: Colors.black },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnPrimary: { backgroundColor: Colors.mainBlue, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  btnPrimaryTxt: { color: Colors.white, fontWeight: '800', fontSize: 14 }
});
