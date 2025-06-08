import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog } from '@/contexts/BlogContext';
import { router } from 'expo-router';
import { BlogPostCard } from '@/components/BlogPostCard';

export default function FollowingScreen() {
  const { user } = useAuth();
  const { posts } = useBlog();

  const followingPosts = user?.following?.length
    ? posts.filter(post => user.following!.includes(post.author.id))
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Following</Text>

      {followingPosts.length > 0 ? (
        <FlatList
          data={followingPosts}
          renderItem={({ item }) => (
            <BlogPostCard post={item} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      ) : (
        <Text style={styles.info}>You are not following anyone yet.</Text>
      )}
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
