import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBlog } from '@/contexts/BlogContext';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPostCard } from '@/components/BlogPostCard';
import { router } from 'expo-router';

export default function LikedPostsScreen() {
  const { posts } = useBlog();
  const { user } = useAuth();

  const likedPosts = user?.id
    ? posts.filter(post => (post.likedBy || []).includes(user.id))
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Liked Posts ({likedPosts.length})</Text>
      <FlatList
        data={likedPosts}
        renderItem={({ item }) => <BlogPostCard post={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>You have not liked any posts yet.</Text>}
        contentContainerStyle={likedPosts.length === 0 ? styles.emptyContainer : undefined}
      />
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
  empty: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#111827',
  },
});
