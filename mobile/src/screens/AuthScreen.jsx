import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AuthScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', is_admin: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic frontend validation
    if (mode === 'register' && !form.username.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المستخدم');
      return;
    }
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password, is_admin: form.is_admin };
      
      const res = await api.post(url, payload);
      await login(res.data.user);
    } catch (err) {
      console.log('API Error:', err);
      let errorMsg = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
      
      if (err.response) {
        // Server responded with non-2xx status
        errorMsg = err.response.data?.error || err.response.data?.message || `خطأ من الخادم (${err.response.status})`;
      } else if (err.request) {
        // Request made but no response received (Network Error)
        errorMsg = `فشل الاتصال بالخادم!\n\n1. تأكد من أن السيرفر (Backend) يشتغل حالياً.\n2. تأكد من الـ IP المكتوب في client.js هو نفس IP جهاز الكمبيوتر حالياً.\n3. تأكد أن الهاتف والكمبيوتر متصلان بنفس شبكة الـ Wi-Fi.\n\nتفاصيل الخطأ: ${err.message || 'Network Error'}`;
      } else {
        // Setup error
        errorMsg = err.message || errorMsg;
      }
      
      Alert.alert('فشل العملية', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>مسار</Text>
            <Text style={styles.logoEn}>MASSAIR</Text>
            <Text style={styles.tagline}>اكتشف الأردن، اربح المكافآت</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab toggle */}
            <View style={styles.tabRow}>
              {['login', 'register'].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.tab, mode === m ? styles.tabActive : null]}
                  onPress={() => setMode(m)}
                >
                  <Text style={[styles.tabText, mode === m ? styles.tabTextActive : null]}>
                    {m === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            {mode === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>اسم المستخدم</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ahmad_Explorer"
                  placeholderTextColor={Colors.darkBlue}
                  value={form.username}
                  onChangeText={v => setForm({ ...form, username: v })}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={Colors.darkBlue}
                value={form.email}
                onChangeText={v => setForm({ ...form, email: v })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.darkBlue}
                value={form.password}
                onChangeText={v => setForm({ ...form, password: v })}
                secureTextEntry
              />
            </View>

            {/* Account type */}
            {mode === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>نوع الحساب</Text>
                <View style={styles.roleRow}>
                  {[{ label: '👤 مستخدم', val: false }, { label: '🛠️ مدير', val: true }].map(opt => (
                    <TouchableOpacity
                      key={String(opt.val)}
                      style={[styles.roleBtn, form.is_admin === opt.val ? styles.roleBtnActive : null]}
                      onPress={() => setForm({ ...form, is_admin: opt.val })}
                    >
                      <Text style={[styles.roleTxt, form.is_admin === opt.val ? styles.roleTxtActive : null]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.btnText}>{mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.mainBlue },
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header:       { alignItems: 'center', marginBottom: 32 },
  logo:         { fontSize: 48, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  logoEn:       { fontSize: 14, color: Colors.paleBlue, letterSpacing: 6, marginTop: -8 },
  tagline:      { color: Colors.secondary, fontSize: 14, marginTop: 8 },
  card:         { backgroundColor: Colors.primary, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  tabRow:       { flexDirection: 'row', backgroundColor: Colors.secondary, borderRadius: 12, marginBottom: 24, padding: 4 },
  tab:          { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  tabActive:    { backgroundColor: Colors.mainBlue },
  tabText:      { color: Colors.darkBlue, fontWeight: '600' },
  tabTextActive:{ color: Colors.white },
  field:        { marginBottom: 16 },
  label:        { color: Colors.black, fontWeight: '700', marginBottom: 6, fontSize: 13 },
  input:        { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.paleBlue, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.black },
  roleRow:      { flexDirection: 'row', gap: 10 },
  roleBtn:      { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.paleBlue, alignItems: 'center' },
  roleBtnActive:{ backgroundColor: Colors.mainBlue, borderColor: Colors.mainBlue },
  roleTxt:      { color: Colors.darkBlue, fontWeight: '600' },
  roleTxtActive:{ color: Colors.white },
  btn:          { backgroundColor: Colors.mainBlue, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText:      { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
