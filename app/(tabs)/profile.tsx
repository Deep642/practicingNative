import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, CreditCard as Edit, LogOut, BookOpen, Users, Heart } from 'lucide-react-native';
import { useThemeMode, ThemeMode } from '@/contexts/ThemeContext';

function ProfileContent() {
  const { user, logout } = useAuth();
  const { theme, mode, setMode } = useThemeMode();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    { label: 'Posts', value: user.postsCount, icon: BookOpen },
    { label: 'Followers', value: user.followersCount, icon: Users },
    { label: 'Following', value: user.followingCount, icon: Heart },
  ];

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' && { backgroundColor: '#18181B' }]}> 
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editButton}>
              <Edit size={16} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.bio && (
              <Text style={styles.userBio}>{user.bio}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <IconComponent size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/my-posts')}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIcon}>
                <BookOpen size={20} color="#6B7280" />
              </View>
              <Text style={styles.actionText}>My Posts</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/liked-posts')}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIcon}>
                <Heart size={20} color="#6B7280" />
              </View>
              <Text style={styles.actionText}>Liked Posts</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/following')}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIcon}>
                <Users size={20} color="#6B7280" />
              </View>
              <Text style={styles.actionText}>Following</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setShowThemeModal(true)}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIcon}>
                <Settings size={20} color="#6B7280" />
              </View>
              <Text style={styles.actionText}>Theme</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Modal */}
        {showThemeModal && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <View style={{ backgroundColor: theme === 'dark' ? '#23232b' : '#fff', borderRadius: 16, padding: 24, width: 300 }}>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 16, color: theme === 'dark' ? '#fff' : '#111' }}>Choose Theme</Text>
              {(['light', 'dark', 'system'] as ThemeMode[]).map(opt => (
                <TouchableOpacity key={opt} style={{ paddingVertical: 12 }} onPress={() => { setMode(opt); setShowThemeModal(false); }}>
                  <Text style={{ color: mode === opt ? '#3B82F6' : theme === 'dark' ? '#fff' : '#111', fontFamily: 'Inter-Medium', fontSize: 16 }}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={{ marginTop: 16, alignSelf: 'flex-end' }} onPress={() => setShowThemeModal(false)}>
                <Text style={{ color: '#3B82F6', fontFamily: 'Inter-Medium', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  return <ProfileContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  editButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userBio: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#374151',
  },
  actionArrow: {
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#EF4444',
  },
});