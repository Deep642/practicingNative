import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { BlogProvider, useBlog } from '@/contexts/BlogContext';
import { CommentItem } from '@/components/CommentItem';
import { ArrowLeft, Heart, MessageCircle, Share, Send, Clock, User } from 'lucide-react-native';

function PostDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, toggleLike, addComment, getComments } = useBlog();
  const [newComment, setNewComment] = useState('');

  const post = posts.find(p => p.id === id);
  const comments = getComments(id!);

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.heroImage} />
          )}

          <View style={styles.articleContent}>
            <Text style={styles.title}>{post.title}</Text>

            <View style={styles.authorSection}>
              <Image
                source={{ uri: post.author.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.publishDate}>{formatDate(post.createdAt)}</Text>
                  <Text style={styles.separator}>•</Text>
                  <View style={styles.readTime}>
                    <Clock size={12} color="#6B7280" />
                    <Text style={styles.readTimeText}>{post.readTime} min read</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.contentText}>{post.content}</Text>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, post.isLiked && styles.likedAction]} 
                onPress={handleLike}
              >
                <Heart 
                  size={20} 
                  color={post.isLiked ? '#EF4444' : '#6B7280'} 
                  fill={post.isLiked ? '#EF4444' : 'transparent'}
                />
                <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                  {post.likesCount} likes
                </Text>
              </TouchableOpacity>

              <View style={styles.actionButton}>
                <MessageCircle size={20} color="#6B7280" />
                <Text style={styles.actionText}>{post.commentsCount} comments</Text>
              </View>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
            
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {comments.length === 0 && (
              <View style={styles.noComments}>
                <MessageCircle size={48} color="#D1D5DB" />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.commentInput}>
          <View style={styles.commentInputContainer}>
            <User size={20} color="#6B7280" />
            <TextInput
              style={styles.commentTextInput}
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send size={20} color={newComment.trim() ? '#3B82F6' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function PostDetailScreen() {
  return (
    <BlogProvider>
      <PostDetailContent />
    </BlogProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#374151',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  articleContent: {
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#111827',
    lineHeight: 36,
    marginBottom: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3B82F6',
  },
  contentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  likedAction: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  likedText: {
    color: '#EF4444',
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  commentsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 16,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  noCommentsSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  commentTextInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});