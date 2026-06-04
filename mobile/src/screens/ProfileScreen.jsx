import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api, { BASE_URL } from '../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/api/users/${user._id}`)
      .then(res => { setProfile(res.data.user); setPhotos(res.data.photos); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={Colors.mainBlue} />
    </SafeAreaView>
  );

  const xp = profile?.total_xp || 0;
  const progress = xp % 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}` }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{profile?.username}</Text>
          <Text style={styles.level}>🎖️ {profile?.current_level || 'Explorer'}</Text>

          {/* XP Bar */}
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.xpText}>{xp} XP · {progress}/100 للمستوى التالي</Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>

        {/* Titles */}
        {profile?.unlocked_titles?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏅 الألقاب</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profile.unlocked_titles.map((title, i) => (
                <View key={i} style={styles.titleBadge}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎖️ الشارات ({profile?.unlocked_badges?.length || 0})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {profile?.unlocked_badges?.map((b, i) => (
              <Image key={i} source={{ uri: b.icon_url }} style={styles.badge} />
            ))}
          </ScrollView>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 صور رحلتي ({photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photos.map(photo => (
              <Image
                key={photo._id}
                source={{ uri: `${BASE_URL}${photo.photo_url}` }}
                style={styles.photo}
              />
            ))}
            {photos.length === 0 ? <Text style={styles.empty}>لا توجد صور بعد</Text> : null}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.primary },
  header:      { backgroundColor: Colors.mainBlue, alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar:      { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.white, backgroundColor: Colors.secondary },
  username:    { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 12 },
  level:       { color: Colors.paleBlue, marginTop: 4 },
  xpBarBg:    { width: '80%', height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: 16 },
  xpBarFill:  { height: 8, backgroundColor: Colors.gold, borderRadius: 4 },
  xpText:     { color: Colors.secondary, fontSize: 12, marginTop: 6 },
  logoutBtn:  { marginTop: 16, backgroundColor: Colors.danger, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  logoutText: { color: Colors.white, fontWeight: '700' },
  section:    { margin: 16 },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: Colors.black, marginBottom: 12 },
  titleBadge: { backgroundColor: Colors.secondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  titleText:  { color: Colors.mainBlue, fontWeight: '700' },
  badge:      { width: 56, height: 56, marginRight: 12, borderRadius: 28 },
  photo:      { width: 120, height: 120, borderRadius: 12, marginRight: 10 },
  empty:      { color: Colors.darkBlue, fontStyle: 'italic' },
});
