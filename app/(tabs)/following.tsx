import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog } from '@/contexts/BlogContext';
import { router } from 'expo-router';

export default function FollowingScreen() {
  const { user } = useAuth();
  const { posts } = useBlog();

  // For demo: show posts by users the current user is following (mocked)
  // In a real app, you would fetch the list of following user IDs from user.followingIds
  // and filter posts by those authors.
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Following</Text>
      <Text style={styles.info}>Feature coming soon: See posts from users you follow!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 16,
  },
  header: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  info: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#111827',
  },
});
